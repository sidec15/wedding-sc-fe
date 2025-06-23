export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  accessControl: {
    origin: 'http://localhost:4200',
    headers: 'Content-Type',
    methods: 'OPTIONS,POST'
  },
  captcha: {
    siteKey: '6LeGlWkrAAAAADh2u8GPtjSZd7AMF4EqGR6fk_-F'
  },
};
