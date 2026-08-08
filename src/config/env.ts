import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

function getEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Environment variable ${name} is not defined`);
  }
  return value;
}

function getOptionalEnv(name: string): string | undefined {
  return process.env[name];
}

export const config = {
  baseUrl: getEnv('BASE_URL'),
  userName: getEnv('EMAIL'),
  password: getEnv('PASSWORD'),
  env: getOptionalEnv('TEST_ENV') || 'QA',
  emailUser: getOptionalEnv('EMAIL_USER'),
  emailPass: getOptionalEnv('EMAIL_PASS'),
  emailTo: getOptionalEnv('EMAIL_TO'),
  buildNumber: getOptionalEnv('BUILD_BUILDNUMBER')
};
