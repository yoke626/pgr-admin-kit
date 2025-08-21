/**
 * 弹出一个文件选择框，让用户选择一个JSON文件，并将其内容解析为指定类型的对象。
 * @returns {Promise<T>} - 一个Promise，解析为从文件中读取和解析出的对象。
 * @template T - 期望从JSON解析出的对象类型。
 */
export function readJson<T>(): Promise<T> {
  return new Promise((resolve, reject) => {
    // 1. 创建一个隐藏的 <input type="file"> 元素
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'application/json' // 只接受 JSON 文件

    // 2. 监听其 change 事件
    input.onchange = (event) => {
      const target = event.target as HTMLInputElement
      if (target.files && target.files.length > 0) {
        const file = target.files[0]
        const reader = new FileReader()

        // 3. 文件读取成功后的回调
        reader.onload = (e) => {
          try {
            const content = e.target?.result as string
            const data = JSON.parse(content) as T
            resolve(data)
          } catch (error) {
            reject(new Error('无法解析JSON文件: ' + error))
          }
        }

        // 4. 文件读取失败后的回调
        reader.onerror = (error) => {
          reject(new Error('读取文件失败: ' + error))
        }

        // 5. 开始读取文件
        reader.readAsText(file)
      } else {
        reject(new Error('没有选择文件'))
      }

      // 清理
      document.body.removeChild(input)
    }

    // 6. 模拟点击以打开文件选择对话框
    input.style.display = 'none'
    document.body.appendChild(input)
    input.click()
  })
}
