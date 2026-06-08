import { detectCityByIp } from '../../services/city-detect.js';

describe('detectCityByIp', () => {
  const prevDevCity = process.env.CITY_DETECT_DEV_CITY;

  afterEach(() => {
    if (prevDevCity === undefined) delete process.env.CITY_DETECT_DEV_CITY;
    else process.env.CITY_DETECT_DEV_CITY = prevDevCity;
  });

  it('returns dev city for localhost when CITY_DETECT_DEV_CITY is set', async () => {
    process.env.CITY_DETECT_DEV_CITY = 'Барнаул';
    const result = await detectCityByIp('127.0.0.1');
    expect(result).toEqual({ city: 'Барнаул', source: 'dev' });
  });

  it('returns null for localhost without dev override', async () => {
    delete process.env.CITY_DETECT_DEV_CITY;
    const result = await detectCityByIp('127.0.0.1');
    expect(result).toEqual({ city: null, source: 'none' });
  });
});
