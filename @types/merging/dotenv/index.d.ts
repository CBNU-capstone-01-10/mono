declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'test' | 'production';
    PROTOCOL: 'http' | 'https';
    HOST: string;
    PORT: string;
    SERVER_URL: string;

    APP_SECRET: string;
    TOKEN_USER_SECRET: string;

    DATABASE_HOST: string;
    DATABASE_PORT: string;
    DATABASE_NAME: string;
    DATABASE_USER: string;
    DATABASE_PASSWORD: string;

    GOOGLE_GMAIL: string;
    GOOGLE_GMAIL_SECRET: string;

    DATABASE_URL: string;

    AUTH_SERVER_ORIGIN: string;
    API_SERVER_ORIGIN: string;
    FOR_DEVELOPER_ORIGIN: string;

    CORS_ALLOWED_ORIGIN: string;
  }
}
