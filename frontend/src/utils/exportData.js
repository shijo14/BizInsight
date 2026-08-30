export function exportToCSV(data, filename) {
  if (!data || !data.length) return

  const keys = Object.keys(data[0])
  const csvContent = [
    keys.join(','), // Header row
    ...data.map(row => 
      keys.map(k => {
        let cell = row[k] === null || row[k] === undefined ? '' : String(row[k])
        // Escape quotes and wrap in quotes if there are commas
        if (cell.includes(',') || cell.includes('"')) {
          cell = `"${cell.replace(/"/g, '""')}"`
        }
        return cell
      }).join(',')
    )
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
