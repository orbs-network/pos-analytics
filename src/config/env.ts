import process from 'process';

const development: boolean = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';

export default function isDev(): boolean {
    return development;
}
const ENV = isDev() ? require('./env.dev') : require('./env.prod');

export { ENV };
