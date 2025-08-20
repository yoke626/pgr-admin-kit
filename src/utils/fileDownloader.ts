/**
 * 将一个 JavaScript 对象下载为格式化的 JSON 文件。
 * @param data - 要下载的 JavaScript 对象。
 * @param filename - 下载后的文件名，默认为 'data.json'。
 */
export function downloadJson(data: object, filename = 'data.json') {
  // 1. 将 JS 对象转换为格式化的 JSON 字符串
  const jsonString = JSON.stringify(data, null, 2)

  // 2. 创建一个 Blob 对象
  const blob = new Blob([jsonString], { type: 'application/json' })

  // 3. 创建一个指向该 Blob 的 URL
  const url = URL.createObjectURL(blob)

  // 4. 创建一个临时的 <a> 标签用于触发下载
  const a = document.createElement('a')
  a.href = url
  a.download = filename

  // 5. 模拟点击 <a> 标签
  document.body.appendChild(a)
  a.click()

  // 6. 清理：移除 <a> 标签并释放 URL 对象
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
