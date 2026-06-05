export default async function handler(req, res) {
  try {
    const response = await fetch(
      "https://api.brevo.com/v3/emailCampaigns?limit=50",
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "accept": "application/json",
        },
      }
    );

    const data = await response.json();

    // 🔍 DEBUG SAFE (utile sur Vercel logs)
    console.log("Brevo response:", data);

    if (!data || !Array.isArray(data.campaigns)) {
      return res.status(500).json({
        error: "Invalid Brevo response",
        raw: data,
      });
    }

    // 🧠 1. Filtrer uniquement les campagnes envoyées
    const sentCampaigns = data.campaigns.filter(
      (c) => c.status === "sent"
    );

    if (sentCampaigns.length === 0) {
      return res.status(404).json({
        error: "No sent campaigns found",
      });
    }

    // 📅 2. Trier par date d’envoi (IMPORTANT FIX)
    const latest = sentCampaigns.sort((a, b) => {
      return new Date(b.sentDate) - new Date(a.sentDate);
    })[0];

    // 🔗 3. Construire le lien proprement
    const url =
      latest.shareLink ||
      latest.archiveUrl ||
      latest.previewUrl ||
      null;

    if (!url) {
      return res.status(404).json({
        error: "No usable URL found for campaign",
        campaign: latest,
      });
    }

    // 🚀 4. Redirection directe (parfait pour Webflow)
    return res.redirect(302, url);

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      error: "Server error",
      details: err.message,
    });
  }
}
