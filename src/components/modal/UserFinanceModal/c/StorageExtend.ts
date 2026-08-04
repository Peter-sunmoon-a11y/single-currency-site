interface SetItemParams {
  key: string;
  value: any;
  expired?: number;
}

class StorageExtend {
  private static instance: StorageExtend | null

  private constructor() {
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new StorageExtend()
    }
    return this.instance
  }

  setItem(params: SetItemParams) {
    if (params.expired) {
      localStorage.setItem(
        params.key,
        JSON.stringify({ value: params.value, expired: params.expired })
      )
    } else {
      localStorage.setItem(
        params.key,
        params.value
      )
    }
  }

  getItem(key: string) {
    let parser: any = ''
    const receive = localStorage.getItem(key)

    try {
      if (receive) parser = JSON.parse(receive)
    } catch (error) {
      parser = receive
    }

    if (parser.expired) {
      if (parser.expired < new Date().getTime()) {
        localStorage.removeItem(key)
        return undefined
      } else {
        return parser.value
      }
    } else {
      return parser
    }
  }

  removeItem(key: string) {
    localStorage.removeItem(key)
  }

  clear() {
    localStorage.clear()
  }
}

export default StorageExtend
