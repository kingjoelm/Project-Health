(() => {
  "use strict";

  const VERSION = "0.12";
  const cfg = window.PROJECT_HEALTH_CLOUD || {};
  const cloud = {
    client: null,
    user: null,
    session: null,
    syncTimer: null,
    syncing: false,
    lastSyncedAt: null,
    deviceId: localStorage.getItem("projectHealthDeviceId") || crypto.randomUUID(),
  };
  localStorage.setItem("projectHealthDeviceId", cloud.deviceId);

  function configured() {
    return Boolean(
      cfg.enabled &&
      cfg.supabaseUrl &&
      cfg.supabasePublishableKey &&
      !cfg.supabaseUrl.includes("YOUR-PROJECT") &&
      !cfg.supabasePublishableKey.includes("YOUR-")
    );
  }

  function setCloudStatus(message, type = "") {
    const targets = [window.cloudStatusText, window.cloudAuthMessage, window.cloudLastSync];
    targets.forEach((el) => {
      if (!el) return;
      el.textContent = message;
      el.className = `muted small ${type ? `export-${type}` : ""}`;
    });
  }

  function initializeClient() {
    if (!configured()) {
      setCloudStatus("Cloud setup is not connected yet. Local records continue to work.");
      document.documentElement.dataset.cloud = "offline";
      return false;
    }
    if (!window.supabase?.createClient) {
      setCloudStatus("Supabase library did not load. Local records continue to work.", "error");
      return false;
    }
    cloud.client = window.supabase.createClient(
      cfg.supabaseUrl,
      cfg.supabasePublishableKey,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      }
    );
    return true;
  }

  async function initializeCloudIdentity() {
    renderCloudConfiguration();
    if (!initializeClient()) {
      renderSignedOut();
      return;
    }

    const { data, error } = await cloud.client.auth.getSession();
    if (error) setCloudStatus(error.message, "error");
    cloud.session = data?.session || null;
    cloud.user = cloud.session?.user || null;

    cloud.client.auth.onAuthStateChange(async (_event, session) => {
      cloud.session = session;
      cloud.user = session?.user || null;
      if (cloud.user) {
        renderSignedIn();
        await loadCloudState();
      } else {
        renderSignedOut();
      }
    });

    if (cloud.user) {
      renderSignedIn();
      await loadCloudState();
    } else {
      renderSignedOut();
    }
  }

  function renderCloudConfiguration() {
    if (window.cloudConfigState) {
      cloudConfigState.textContent = configured() ? "Configured" : "Setup required";
    }
  }

  function renderSignedOut() {
    document.documentElement.dataset.cloud = "signed-out";
    window.cloudSignedOut?.classList.remove("hide");
    window.cloudSignedIn?.classList.add("hide");
    if (window.cloudUserEmail) cloudUserEmail.textContent = "";
    setCloudStatus(configured() ? "Sign in to securely sync your records." : "Cloud setup is not connected yet.");
  }

  function renderSignedIn() {
    document.documentElement.dataset.cloud = "signed-in";
    window.cloudSignedOut?.classList.add("hide");
    window.cloudSignedIn?.classList.remove("hide");
    if (window.cloudUserEmail) cloudUserEmail.textContent = cloud.user?.email || "Signed in";
    if (window.cloudStatusText) cloudStatusText.textContent = "Cloud account connected";
  }

  async function cloudSignUp() {
    if (!cloud.client) return alert("Cloud setup is not configured yet.");
    const email = cloudEmail.value.trim();
    const password = cloudPassword.value;
    const displayName = cloudDisplayName.value.trim();
    const primaryGoal = cloudPrimaryGoal.value;
    if (!email || !password || !displayName) return alert("Enter your name, email, and password.");
    if (password.length < 8) return alert("Use a password with at least 8 characters.");

    cloudAuthMessage.textContent = "Creating account...";
    const { data, error } = await cloud.client.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
          primary_goal: primaryGoal,
        },
        emailRedirectTo: cfg.redirectUrl || window.location.origin + window.location.pathname,
      },
    });
    if (error) return setCloudStatus(error.message, "error");
    if (!data.session) {
      setCloudStatus("Account created. Check your email to confirm the account.", "success");
    } else {
      setCloudStatus("Account created and signed in.", "success");
    }
  }

  async function cloudSignIn() {
    if (!cloud.client) return alert("Cloud setup is not configured yet.");
    const email = cloudEmail.value.trim();
    const password = cloudPassword.value;
    if (!email || !password) return alert("Enter email and password.");
    cloudAuthMessage.textContent = "Signing in...";
    const { error } = await cloud.client.auth.signInWithPassword({ email, password });
    if (error) return setCloudStatus(error.message, "error");
    setCloudStatus("Signed in. Loading your cloud records...", "success");
  }

  async function cloudSignOut() {
    if (!cloud.client) return;
    const { error } = await cloud.client.auth.signOut({ scope: "local" });
    if (error) return setCloudStatus(error.message, "error");
    setCloudStatus("Signed out on this device.", "success");
  }

  async function cloudResetPassword() {
    if (!cloud.client) return alert("Cloud setup is not configured yet.");
    const email = cloudEmail.value.trim();
    if (!email) return alert("Enter your email first.");
    const { error } = await cloud.client.auth.resetPasswordForEmail(email, {
      redirectTo: cfg.redirectUrl || window.location.href,
    });
    if (error) return setCloudStatus(error.message, "error");
    setCloudStatus("Password-reset email sent.", "success");
  }

  function getStateSnapshot() {
    return {
      schemaVersion: 1,
      exportedAt: new Date().toISOString(),
      activeProfileId: window.activeProfileId || "default",
      profileDB: window.profileDB || null,
      currentState: window.state || null,
    };
  }

  async function saveCloudState(options = {}) {
    if (!cloud.client || !cloud.user || cloud.syncing) return false;
    cloud.syncing = true;
    if (!options.silent) setCloudStatus("Syncing...");
    try {
      const snapshot = getStateSnapshot();
      const { error } = await cloud.client
        .from("user_state")
        .upsert(
          {
            user_id: cloud.user.id,
            state: snapshot,
            app_version: VERSION,
            device_id: cloud.deviceId,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" }
        );
      if (error) throw error;
      cloud.lastSyncedAt = new Date();
      localStorage.setItem("projectHealthLastCloudSync", cloud.lastSyncedAt.toISOString());
      setCloudStatus(`Last synced ${cloud.lastSyncedAt.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`, "success");
      return true;
    } catch (error) {
      console.error("Cloud save failed", error);
      setCloudStatus(`Cloud sync paused: ${error.message}`, "error");
      return false;
    } finally {
      cloud.syncing = false;
    }
  }

  async function loadCloudState() {
    if (!cloud.client || !cloud.user) return false;
    setCloudStatus("Checking cloud records...");
    try {
      const { data, error } = await cloud.client
        .from("user_state")
        .select("state, updated_at, device_id")
        .eq("user_id", cloud.user.id)
        .maybeSingle();
      if (error) throw error;
      const remote = data?.state;
      if (!remote?.profileDB && !remote?.currentState) {
        await saveCloudState();
        return true;
      }

      const localHasRecords =
        (window.state?.sessions?.length || 0) +
        (window.state?.activities?.length || 0) +
        (window.state?.meals?.length || 0) > 0;

      if (localHasRecords && !sessionStorage.getItem("projectHealthCloudMergeAsked")) {
        sessionStorage.setItem("projectHealthCloudMergeAsked", "1");
        const useCloud = confirm(
          "Cloud records were found. Press OK to load cloud records on this device. Press Cancel to keep this device's current records and upload them."
        );
        if (!useCloud) {
          await saveCloudState();
          return true;
        }
      }

      if (remote.profileDB) {
        window.profileDB = remote.profileDB;
        localStorage.setItem("projectHealthProfilesV09", JSON.stringify(remote.profileDB));
      }
      if (remote.activeProfileId) {
        window.activeProfileId = remote.activeProfileId;
        localStorage.setItem("projectHealthActiveProfile", remote.activeProfileId);
      }
      if (remote.currentState) {
        window.state = remote.currentState;
        localStorage.setItem("projectHealthV0111", JSON.stringify(remote.currentState));
      }
      setCloudStatus("Cloud records loaded. Refreshing the app...", "success");
      setTimeout(() => location.reload(), 500);
      return true;
    } catch (error) {
      console.error("Cloud load failed", error);
      setCloudStatus(`Could not load cloud records: ${error.message}`, "error");
      return false;
    }
  }

  function scheduleCloudSync() {
    if (!cloud.user) return;
    clearTimeout(cloud.syncTimer);
    cloud.syncTimer = setTimeout(() => saveCloudState({ silent: true }), 1200);
  }

  async function submitCloudFeedback() {
    if (!cloud.client || !cloud.user) {
      return alert("Sign in to submit feedback directly. You can still copy the feedback report.");
    }
    const message = feedbackText.value.trim();
    if (!message) return alert("Enter feedback first.");
    const diagnostics = {
      userAgent: navigator.userAgent,
      profileName: window.state?.profile?.name || "",
      page: document.querySelector(".screen.active")?.id || "",
      deviceId: cloud.deviceId,
    };
    const { error } = await cloud.client.from("beta_feedback").insert({
      user_id: cloud.user.id,
      tester_id: window.state?.tester?.id || "",
      category: feedbackCategory.value,
      message,
      app_version: VERSION,
      diagnostics,
    });
    if (error) return setCloudStatus(error.message, "error");
    feedbackText.value = "";
    setCloudStatus("Feedback submitted securely.", "success");
    window.showToast?.("Feedback submitted");
  }

  async function deleteCloudData() {
    if (!cloud.client || !cloud.user) return;
    const phrase = prompt('Type DELETE CLOUD DATA to remove your synced Project Health records. This does not delete the login account.');
    if (phrase !== "DELETE CLOUD DATA") return;
    const { error } = await cloud.client.from("user_state").delete().eq("user_id", cloud.user.id);
    if (error) return setCloudStatus(error.message, "error");
    setCloudStatus("Cloud health records deleted.", "success");
  }

  window.ProjectHealthCloud = {
    initialize: initializeCloudIdentity,
    scheduleSync: scheduleCloudSync,
    saveNow: saveCloudState,
    loadNow: loadCloudState,
    signUp: cloudSignUp,
    signIn: cloudSignIn,
    signOut: cloudSignOut,
    resetPassword: cloudResetPassword,
    submitFeedback: submitCloudFeedback,
    deleteCloudData,
    configured,
  };
})();
