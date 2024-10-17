import type {Component} from 'solid-js'
import Container from './ui/Container'
import MyChart from './MyChart'
import Title from './ui/Title'

const App: Component = () => {
  return (
    <Container>
      <Title>Ryzen 7 8700G</Title>
      <div class="my-4">
        <hr class="border-gray-700"/>
      </div>
      <MyChart/>
    </Container>
  )
}

export default App
