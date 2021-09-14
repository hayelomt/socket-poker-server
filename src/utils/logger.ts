import pinoLogger from 'pino';
import dayjs from 'dayjs';

export default pinoLogger({
  prettyPrint: true,
  base: {
    pid: false,
  },
  timestamp: () => `,"time":"${dayjs().format()}`,
});
