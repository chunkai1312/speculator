import { Exchange } from '@speculator/common';

export function getSymbolFromSectorName(name: string, exchange: Exchange) {
  if (exchange === Exchange.TWSE) {
    const sectors = {
      '水泥類指數': 'IX0010',
      '食品類指數': 'IX0011',
      '塑膠類指數': 'IX0012',
      '紡織纖維類指數': 'IX0016',
      '電機機械類指數': 'IX0017',
      '電器電纜類指數': 'IX0018',
      '化學生技醫療類指數': 'IX0019',
      '化學類指數': 'IX0020',
      '生技醫療類指數': 'IX0021',
      '玻璃陶瓷類指數': 'IX0022',
      '造紙類指數': 'IX0023',
      '鋼鐵類指數': 'IX0024',
      '橡膠類指數': 'IX0025',
      '汽車類指數': 'IX0026',
      '電子類指數': 'IX0027',
      '半導體類指數': 'IX0028',
      '電腦及週邊設備類指數': 'IX0029',
      '光電類指數': 'IX0030',
      '通信網路類指數': 'IX0031',
      '電子零組件類指數': 'IX0032',
      '電子通路類指數': 'IX0033',
      '資訊服務類指數': 'IX0034',
      '其他電子類指數': 'IX0035',
      '建材營造類指數': 'IX0036',
      '航運業類指數': 'IX0037',
      '觀光事業類指數': 'IX0038',
      '金融保險類指數': 'IX0039',
      '貿易百貨類指數': 'IX0040',
      '油電燃氣類指數': 'IX0041',
      '其他類指數': 'IX0042',
      '電子工業類指數': 'IX0027', // 電子類指數
      '航運類指數': 'IX0037', // 航運業類指數
      '觀光類指數': 'IX0038', // 觀光事業類指數
    }
    return sectors[name];
  }

  if (exchange === Exchange.TPEx) {
    const sectors = {
      '光電業': 'IX0055',
      '其他': 'IX0100',
      '其他電子業': 'IX0099',
      '化學工業': 'IX0051',
      '半導體業': 'IX0053',
      // '塑膠工業': '',
      '建材營造': 'IX0048',
      '文化創意業': 'IX0075',
      // '橡膠工業': '',
      // '油電燃氣業': '',
      '生技醫療': 'IX0052',
      '紡織纖維': 'IX0044',
      '航運業': 'IX0049',
      '觀光事業': 'IX0050',
      // '貿易百貨': '',
      '資訊服務業': 'IX0059',
      // '農業科技': '',
      '通信網路業': 'IX0056',
      // '金融業': '',
      '鋼鐵工業': 'IX0046',
      // '電器電纜': '',
      // '電子商務': '',
      '電子通路業': 'IX0058',
      '電子零組件業': 'IX0057',
      '電機機械': 'IX0045',
      '電腦及週邊設備業': 'IX0054',
      // '食品工業': '',
      '電子工業': 'IX0047', // 額外
    }
    return sectors[name];
  }
}
