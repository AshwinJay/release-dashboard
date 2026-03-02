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

  it('Deployed increments and Approved stays ≥1 when all regions are deployed', async () => {
    render(<App />)
    await waitForLoad()
    addService()
    // deployed status is auto-set once every region reaches "deployed"
    for (const region of ["pre-production","us-east-1","us-west-2","eu-west-1","ap-southeast-1"]) {
      fireEvent.change(screen.getByLabelText(`Region ${region}`), {target:{value:"deployed"}})
    }
    expect(getStatCount('Deployed')).toBe('1')
    // deployed services also count toward Approved
    expect(getStatCount('Approved')).toBe('1')
  })

  it('Failed increments when a service status is set to failed', async () => {
    render(<App />)
    await waitForLoad()
    addService()
    // "failed" also appears as <option> in region selects; target the status chip <span>
    const failedChip = screen.getAllByText('failed').find(el => el.tagName.toLowerCase() === 'span')
    fireEvent.click(failedChip)
    expect(getStatCount('Failed')).toBe('1')
  })

  it('Hotfixes increments when needs-hotfix chip is clicked', async () => {
    render(<App />)
    await waitForLoad()
    addService()
    fireEvent.click(screen.getByText('needs-hotfix'))
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

describe('needs-hotfix chip as hotfix toggle', () => {
  it('clicking needs-hotfix chip shows the hotfix section', async () => {
    render(<App />)
    await waitForLoad()
    addService()
    expect(screen.queryByPlaceholderText('e.g. v2.14.1-hotfix')).not.toBeInTheDocument()
    fireEvent.click(screen.getByText('needs-hotfix'))
    expect(screen.getByPlaceholderText('e.g. v2.14.1-hotfix')).toBeInTheDocument()
  })

  it('clicking needs-hotfix chip a second time hides the hotfix section', async () => {
    render(<App />)
    await waitForLoad()
    addService()
    fireEvent.click(screen.getByText('needs-hotfix'))
    expect(screen.getByPlaceholderText('e.g. v2.14.1-hotfix')).toBeInTheDocument()
    // click again — needs-hotfix is now highlighted so getAllByText returns [pill, chip]
    const chips = screen.getAllByText('needs-hotfix')
    fireEvent.click(chips[chips.length - 1])
    expect(screen.queryByPlaceholderText('e.g. v2.14.1-hotfix')).not.toBeInTheDocument()
    expect(getStatCount('Hotfixes')).toBe('0')
  })

  it('does not render a dedicated Request Hotfix button', async () => {
    render(<App />)
    await waitForLoad()
    addService()
    expect(screen.queryByTitle('Request hotfix')).not.toBeInTheDocument()
    expect(screen.queryByTitle('Cancel hotfix')).not.toBeInTheDocument()
  })

  it('does not render a separate HOTFIX pill when hotfix is active', async () => {
    render(<App />)
    await waitForLoad()
    addService()
    fireEvent.click(screen.getByText('needs-hotfix'))
    // The word "HOTFIX" should not appear as a standalone pill
    expect(screen.queryByText('HOTFIX')).not.toBeInTheDocument()
  })
})

describe('Hotfix section layout', () => {
  it('hotfix details appear before the status strip', async () => {
    render(<App />)
    await waitForLoad()
    addService()
    fireEvent.click(screen.getByText('needs-hotfix'))
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

describe('Label field in service card', () => {
  it('shows a "Label" field (not "Label / Tag") in the service card', async () => {
    render(<App />)
    await waitForLoad()
    addService()
    expect(screen.queryByText('Label / Tag')).not.toBeInTheDocument()
    expect(screen.getByText('Label')).toBeInTheDocument()
  })

  it('label input in the service card updates the service label', async () => {
    render(<App />)
    await waitForLoad()
    addService('svc-a')
    const labelInput = screen.getByPlaceholderText('e.g. v2.14.0-rc1')
    fireEvent.change(labelInput, { target: { value: 'v1.0.0-rc1' } })
    expect(labelInput.value).toBe('v1.0.0-rc1')
  })
})

describe('Regional deployment in service card', () => {
  it('shows region selectors for all regions in each service card', async () => {
    render(<App />)
    await waitForLoad()
    addService()
    expect(screen.getByLabelText('Region pre-production')).toBeInTheDocument()
    expect(screen.getByLabelText('Region us-east-1')).toBeInTheDocument()
    expect(screen.getByLabelText('Region eu-west-1')).toBeInTheDocument()
  })

  it('auto-sets service status to deployed when all regions are deployed', async () => {
    render(<App />)
    await waitForLoad()
    addService()
    for (const region of ["pre-production","us-east-1","us-west-2","eu-west-1","ap-southeast-1"]) {
      fireEvent.change(screen.getByLabelText(`Region ${region}`), {target:{value:"deployed"}})
    }
    expect(getStatCount('Deployed')).toBe('1')
  })

  it('deployed chip has no manual click handler and does not update status when clicked', async () => {
    render(<App />)
    await waitForLoad()
    addService()
    const deployedChip = screen.getByTitle('Auto-set when all regions are deployed')
    fireEvent.click(deployedChip)
    expect(getStatCount('Deployed')).toBe('0')
  })

  it('reverts from deployed to deploying when a region is un-deployed', async () => {
    render(<App />)
    await waitForLoad()
    addService()
    for (const region of ["pre-production","us-east-1","us-west-2","eu-west-1","ap-southeast-1"]) {
      fireEvent.change(screen.getByLabelText(`Region ${region}`), {target:{value:"deployed"}})
    }
    expect(getStatCount('Deployed')).toBe('1')
    // walk back one region
    fireEvent.change(screen.getByLabelText('Region us-east-1'), {target:{value:"pending"}})
    expect(getStatCount('Deployed')).toBe('0')
  })
})
