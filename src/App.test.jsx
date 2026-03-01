import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import App from './App'

// Wait for the loading spinner to disappear before making assertions.
async function waitForLoad() {
  await waitFor(() => expect(screen.queryByText('Loading…')).not.toBeInTheDocument())
}

describe('Phase bar', () => {
  it('is not rendered in the dashboard', async () => {
    render(<App />)
    await waitForLoad()
    // "Planning" only appears in the phase bar — it is not a checklist phase label
    expect(screen.queryByText('Planning')).not.toBeInTheDocument()
  })

  it('does not render the Mon Review phase step', async () => {
    render(<App />)
    await waitForLoad()
    // "Mon Review" appears in both the phase bar and the checklist pills;
    // on the default "board" tab there is no checklist, so its presence
    // means the phase bar is still rendered.
    expect(screen.queryByText('Mon Review')).not.toBeInTheDocument()
  })
})

describe('Checklist tab', () => {
  it('still renders phase pills after phase bar removal', async () => {
    render(<App />)
    await waitForLoad()
    fireEvent.click(screen.getByText('Release Checklist'))
    // Phase pills should still appear next to checklist items
    expect(screen.getAllByText('Branch Cut').length).toBeGreaterThan(0)
  })
})
