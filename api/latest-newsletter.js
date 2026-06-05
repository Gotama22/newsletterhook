export default async function handler(req, res) {
  const response = await fetch(
    "https://api.brevo.com/v3/emailCampaigns?limit=50",
    {
      headers: {
        "api-key": process.env.BREVO_API_KEY,
      },
    }
  );

  const data = await response.json();

  const campaigns = data.campaigns;

  if (!campaigns || campaigns.length === 0) {
    return res.status(404).send("No campaigns");
  }

  // dernière campagne
  const latest = campaigns[0];

  // ⚠️ parfois il faut construire le lien différemment
  const url =
    latest.shareLink ||
    latest.archiveUrl ||
    latest.previewUrl;

  if (!url) {
    return res.status(404).send("No URL found");
  }

  // redirection directe
  res.redirect(302, url);
}
