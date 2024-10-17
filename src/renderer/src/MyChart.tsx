import { createSignal, onMount, Show } from 'solid-js'
import { Chart, Title, Tooltip, Legend, Colors, ChartData, ChartOptions } from 'chart.js'
import { Line } from 'solid-chartjs'
import { ObservedDate, PriceSource } from './types'

type MyChartData = ChartData<'line', (number | null)[], string>

const comparator = (prev: MyChartData | null, next: MyChartData | null) => {
  if (prev === null && next === null) return true
  if (prev === null || next === null) return false
  if (!(typeof prev === 'object' && typeof next === 'object')) return false
  if (!Array.isArray(prev.labels) || !Array.isArray(next.labels)) return false
  if (!Array.isArray(prev.datasets) || !Array.isArray(next.datasets)) return false
  if (prev.labels.length !== next.labels.length) return false
  if (prev.datasets.length !== next.datasets.length) return false
  const prevLabels = prev.labels
  const nextLabels = next.labels
  if (!prevLabels.every((it, i) => it === nextLabels[i])) return false
  const prevDatasets = prev.datasets
  const nextDatasets = next.datasets
  return prevDatasets.every((prevDataset, i) => {
    const nextDataset = nextDatasets[i]
    if (prevDataset.label !== nextDataset.label) return false
    if (!Array.isArray(prevDataset.data) || !Array.isArray(nextDataset.data)) return false
    if (prevDataset.data.length !== nextDataset.data.length) return false
    return prevDataset.data.every((it, i) => it === nextDataset.data[i])
  });

}

const MyChart = () => {
  /**
   * You must register optional elements before using the chart,
   * otherwise you will have the most primitive UI
   */
  onMount(() => {
    Chart.register(Title, Tooltip, Legend, Colors)
  })

  const [chartData, setChartData] = createSignal<MyChartData | null>(null, {
    equals: comparator
  })

  window.electron.ipcRenderer.on('dataSource.update', (data) => {
    console.log('dataSource.update', data)

    const array = data as ObservedDate[]

    const labels: MyChartData['labels'] = array.map(it => it.date)
    let datasets: MyChartData['datasets'] = [PriceSource.Kabum, PriceSource.Pichau, PriceSource.Terabyte]
      .map(source => ({
        label: source,
        data: array.map(it => it.prices.find(price => price.from === source)?.price || null),
      }))
    datasets = datasets.filter(it => it.data.length > 0)

    let newVar = {
      labels,
      datasets
    }
    console.log(newVar)
    setChartData(newVar)
  })

  const chartOptions: ChartOptions<'line'> = {
    responsive: false,
    maintainAspectRatio: true,
    scales: {
      x: {
        title: {
          display: true,
          text: 'Data'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Preço',
        },
        suggestedMin: 1500
      }
    }
  }

  return (
    <Show when={chartData() !== null}>
      <Line data={chartData()} options={chartOptions} width={500} height={300} />
    </Show>
  )
}

export default MyChart
