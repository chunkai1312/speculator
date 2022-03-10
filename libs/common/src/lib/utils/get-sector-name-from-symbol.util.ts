import { Exchange } from '@speculator/common';

export function getSectorNameFromSymbol(symbol: string, exchange: Exchange) {
  if (exchange === Exchange.TWSE) {
    const sectors = {
      'IX0010': '水泥',
      'IX0011': '食品',
      'IX0012': '塑膠',
      'IX0016': '紡織纖維',
      'IX0017': '電機機械',
      'IX0018': '電器電纜',
      'IX0019': '化學生技醫療',
      'IX0020': '化工',
      'IX0021': '生技醫療',
      'IX0022': '玻璃陶瓷',
      'IX0023': '造紙',
      'IX0024': '鋼鐵',
      'IX0025': '橡膠',
      'IX0026': '汽車',
      'IX0027': '電子',
      'IX0028': '半導體',
      'IX0029': '電腦及週邊設備',
      'IX0030': '光電',
      'IX0031': '通信網路',
      'IX0032': '電子零組件',
      'IX0033': '電子通路',
      'IX0034': '資訊服務',
      'IX0035': '其他電子',
      'IX0036': '建材營造',
      'IX0037': '航運',
      'IX0038': '觀光',
      'IX0039': '金融保險',
      'IX0040': '貿易百貨',
      'IX0041': '油電燃氣',
      'IX0042': '其他',
    }
    return sectors[symbol];
  }

  if (exchange === Exchange.TPEx) {
    const sectors = {
      'IX0055': '光電業',
      'IX0100': '其他',
      'IX0099': '其他電子',
      'IX0051': '化工',
      'IX0053': '半導體',
      'IX0048': '建材營造',
      'IX0075': '文化創意',
      'IX0052': '生技醫療',
      'IX0044': '紡織纖維',
      'IX0049': '航運',
      'IX0050': '觀光事業',
      'IX0059': '資訊服務',
      'IX0056': '通信網路',
      'IX0046': '鋼鐵',
      'IX0058': '電子通路',
      'IX0057': '電子零組件',
      'IX0045': '電機機械',
      'IX0054': '電腦及週邊設備',
      'IX0047': '電子',
    }
    return sectors[symbol];
  }
}
