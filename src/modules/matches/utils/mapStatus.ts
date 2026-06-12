export function mapStatus(apiStatus: string): 'SCHEDULED' | 'IN_PLAY' | 'FINISHED' {
  switch (apiStatus) {
    case 'NS':
    case 'TBD':
    case 'PST':
      return 'SCHEDULED'
    case '1H':
    case '2H':
    case 'HT':
    case 'ET':
    case 'P':
    case 'LIVE':
      return 'IN_PLAY'
    case 'FT':
    case 'AET':
    case 'PEN':
    case 'AWD':
    case 'WO':
      return 'FINISHED'
    default:
      return 'SCHEDULED'
  }
}
