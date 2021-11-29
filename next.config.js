module.exports = {
  reactStrictMode: true,
  exportPathMap: async function (
    defaultPathMap,
    { dev, dir, outDir, distDir, buildId }
  ) {
    return {
      "/": {
        page: "/App"
      },
      "/campaign": {
        page: "/campaigns/NewCampaign"
      },
      "/campaigns/:address": {
        page: "/campaigns/Campaign"
      },
      "/campaigns/:address/requests": {
        page: "/campaigns/requests/Requests"
      },
      "/campaigns/:address/requests/new": {
        page: "/campaigns/requests/NewRequest"
      }
    }
  }
}
