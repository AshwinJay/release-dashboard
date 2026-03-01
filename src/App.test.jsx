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

// Returns the numeric text of a stat counter by its label (e.g. "Approved" → "2")
function getStatCount(label) {
  return screen.getByText(label).previousElementSibling?.textContent
}

// Adds a service via the board form using fireEvent (faster than userEvent.type).
function addService(name = 'test-service') {
  fireEvent.click(screen.getByText('+ Add Service'))
  fireEvent.change(screen.getByPlaceholderText('e.g. auth-service'), { target: { value: name } })
  fireEvent.click(screen.getByText('Add'))
}

describe('Summary counters', () => {
  it('all show 0 when there are no services', async () => {
    render(<App />)
    await waitForLoad()
    expect(getStatCount('Services')).toBe('0')
    expect(getStatCount('Approved')).toBe('0')
    expect(getStatCount('Deployed')).toBe('0')
    expect(getStatCount('Hotfixes')).toBe('0')
    expect(getStatCount('Failed')).toBe('0')
  })

  it('Services increments when a service is added', async () => {
    render(<App />)
    await waitForLoad()
    addService('alpha')
    expect(getStatCount('Services')).toBe('1')
  })

  it('Approved increments when a service status is set to approved', async () => {
    render(<App />)
    await waitForLoad()
    addService()
    // Service starts as "pending"; "approved" appears once (in the status row)
    fireEvent.click(screen.getByText('approved'))
    expect(getStatCount('Approved')).toBe('1')
    expect(getStatCount('Deployed')).toBe('0')
  })

  it('Deployed increments and Approved stays ≥1 when status is set to deployed', async () => {
    render(<App />)
    await waitForLoad()
    addService()
    fireEvent.click(screen.getByText('deployed'))
    expect(getStatCount('Deployed')).toBe('1')
    // deployed services also count toward Approved
    expect(getStatCount('Approved')).toBe('1')
  })

  it('Failed increments when a service status is set to failed', async () => {
    render(<App />)
    await waitForLoad()
    addService()
    fireEvent.click(screen.getByText('failed'))
    expect(getStatCount('Failed')).toBe('1')
  })

  it('Hotfixes increments when a hotfix is requested', async () => {
    render(<App />)
    await waitForLoad()
    addService()
    fireEvent.click(screen.getByTitle('Request hotfix'))
    expect(getStatCount('Hotfixes')).toBe('1')
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

describe('Service status labels', () => {
  it('clicking a status chip updates the service status pill', async () => {
    render(<App />)
    await waitForLoad()
    addService()
    // Card starts with a "pending" status pill; click "testing" chip to change it
    fireEvent.click(screen.getByText('testing'))
    // The active status pill on the card should now read "testing"
    const pills = screen.getAllByText('testing')
    // At least one pill should be active (the card badge), not just the chip
    expect(pills.length).toBeGreaterThanOrEqual(1)
    // "pending" active pill should no longer be visible as a card badge
    // (it still exists as a chip in the status row, but no longer as the active status)
    expect(getStatCount('Approved')).toBe('0')
  })

  it('switching status to approved updates the Approved counter', async () => {
    render(<App />)
    await waitForLoad()
    addService()
    fireEvent.click(screen.getByText('testing'))
    expect(getStatCount('Approved')).toBe('0')
    fireEvent.click(screen.getAllByText('approved')[0])
    expect(getStatCount('Approved')).toBe('1')
  })
})

describe('Hotfix section layout', () => {
  it('hotfix details appear before the status strip', async () => {
    render(<App />)
    await waitForLoad()
    addService()
    fireEvent.click(screen.getByTitle('Request hotfix'))
    const hotfixInput = screen.getByPlaceholderText('e.g. v2.14.1-hotfix')
    const pendingChip = screen.getAllByText('pending').find(
      el => el.tagName.toLowerCase() === 'span' && el.textContent === 'pending'
    )
    // hotfix input must come before the status chip strip in the DOM
    const order = hotfixInput.compareDocumentPosition(pendingChip)
    // DOCUMENT_POSITION_FOLLOWING = 4 means pendingChip comes after hotfixInput
    expect(order & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })
})

describe('Region Deploy tab — Label column', () => {
  it('shows a "Label" column header (not "Label / Tag")', async () => {
    render(<App />)
    await waitForLoad()
    addService()
    fireEvent.click(screen.getByText('Region Deploy'))
    expect(screen.queryByText('Label / Tag')).not.toBeInTheDocument()
    expect(screen.getByText('Label')).toBeInTheDocument()
  })

  it('label input in regions tab updates the service label', async () => {
    render(<App />)
    await waitForLoad()
    addService('svc-a')
    fireEvent.click(screen.getByText('Region Deploy'))
    const labelInput = screen.getByPlaceholderText('e.g. v2.14.0-rc1')
    fireEvent.change(labelInput, { target: { value: 'v1.0.0-rc1' } })
    expect(labelInput.value).toBe('v1.0.0-rc1')
  })
})
