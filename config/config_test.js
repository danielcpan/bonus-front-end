module.exports = {
  GRAPHQL_ENDPOINT: 'https://dsp-be-test.herokuapp.com/v1/graphql',
  GRAPHQL_WEBSOCKET_ENDPOINT: 'wss://dsp-be-test.herokuapp.com/v1/graphql',
  IT_ROOT_URL: 'https://apidev.appliedmed.com/ITProjects',
  DECISIONS_ENDPOINT: 'https://decisionsdev1.appliedmed.com',
  DECISIONS2_ENDPOINT: 'https://decisionsdev2.appliedmed.com',
  GRAPHQL_SECRET: process.env.GRAPHQL_SECRET,

  // FROM PACKAGE.JSON
  AUTHBASEURL: 'https://api.appliedmed.com/Authdev',
  BASEURL: 'https://apidev.appliedmed.com/MyApplied',
  CONTENTURL: 'https://webassets.appliedmedical.com/content',
  DEVMODE: false,
  ECOMMERCEBASEURL: 'https://apidev.appliedmed.com/companystore',
  ISPREVIEW: false,
  ITROOTURL: 'https://apiqa.appliedmed.com/ITProjects',
  ITAPPROOTURL: 'https://appqa.appliedmed.com/ITProjects'
};
