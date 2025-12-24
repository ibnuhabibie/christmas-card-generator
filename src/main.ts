import './style.css'
import html2canvas from 'html2canvas'

// --- Assets Data (from public/assets) ---
const assetFiles = [
  '3d-icon-1.png', '3d-icon-2.png', '3d-icon-3.png', '3d-icon-4.png', '3d-icon-5.png',
  'dolty-1.png', 'dolty-2.png', 'dolty-3.png', 'dolty-4.png', 'dolty-5.png', 'dolty-6.png', 'dolty-7.png', 'dolty-8.png', 'dolty-9.png', 'dolty-10.png', 'dolty-11.png', 'dolty-12.png', 'dolty-13.png', 'dolty-14.png', 'dolty-15.png',
  'snowman.png',
  'tree-1.png', 'tree-2.png', 'tree-3.png', 'tree-4.png', 'tree-5.png', 'tree-6.png', 'tree-7.png', 'tree-8.png', 'tree-9.png', 'tree-10.png',
  'xmas.png'
]

function toTitle(name: string) {
  const base = name.replace(/\.[^/.]+$/, '').replace(/-/g, ' ')
  return base.replace(/\b\w/g, c => c.toUpperCase())
}

const assets = assetFiles.map(f => ({
  id: f.replace(/\.[^/.]+$/, ''),
  src: `/assets/${f}`,
  name: toTitle(f)
}))

// --- Initialization ---
const assetsList = document.getElementById('assets-list')!
const cardCanvas = document.getElementById('card-canvas')!
const addTextBtn = document.getElementById('add-text-btn')!
const downloadBtn = document.getElementById('download-btn')!
const canvasWidthInput = document.getElementById('canvas-width') as HTMLInputElement
const canvasHeightInput = document.getElementById('canvas-height') as HTMLInputElement
const presetLandscape = document.getElementById('preset-landscape')!
const presetPortrait = document.getElementById('preset-portrait')!
const floatingToolbar = document.getElementById('floating-toolbar')!
const floatFont = document.getElementById('float-font') as HTMLSelectElement
const floatColor = document.getElementById('float-color') as HTMLInputElement
const floatDelete = document.getElementById('float-delete') as HTMLButtonElement
const textControls = floatingToolbar.querySelector('.text-controls') as HTMLElement
const canvasBgColor = document.getElementById('canvas-bg-color') as HTMLInputElement

let selectedElement: HTMLElement | null = null

// --- Populate Assets ---
assets.forEach(asset => {
  const img = document.createElement('img')
  img.src = asset.src
  img.alt = asset.name
  img.className = 'asset-item'
  img.draggable = true
  img.dataset.id = asset.id

  img.addEventListener('dragstart', (e) => {
    e.dataTransfer!.setData('text/plain', asset.src)
    e.dataTransfer!.effectAllowed = 'copy'
  })

  assetsList.appendChild(img)
})

// --- Initial Template ---
function initTemplate() {
  // Background already set by control if changed; add a festive setup
  
  // Tree on left
  createImageElement('/assets/tree-3.png', 80, 220, 305, 380)
  // Snowman on right
  createImageElement('/assets/snowman.png', 230, 400, 180, 180)
  // Title text at top
  const title = document.createElement('div')
  title.className = 'canvas-item text-item'
  title.contentEditable = 'true'
  title.innerText = 'Merry Christmas!'
  title.style.fontSize = '50px'
  title.style.fontFamily = "'Great Vibes', cursive"
  title.style.color = '#d42426'
  title.style.left = `40px`
  title.style.top = `50px`
  addResizeHandles(title)
  cardCanvas.appendChild(title)
  makeDraggable(title)
  // Subtitle
  const subtitle = document.createElement('div')
  subtitle.className = 'canvas-item text-item'
  subtitle.contentEditable = 'true'
  subtitle.innerText = 'Wishing you joy and warmth'
  subtitle.style.fontSize = '18px'
  subtitle.style.fontFamily = "'Raleway', sans-serif"
  subtitle.style.color = '#165b33'
  subtitle.style.left = `80px`
  subtitle.style.top = `120px`
  addResizeHandles(subtitle)
  cardCanvas.appendChild(subtitle)
  makeDraggable(subtitle)

  deselectAll()
}

// --- Canvas Size Logic ---
function resizeCanvas(w: number, h: number) {
  cardCanvas.style.width = `${w}px`
  cardCanvas.style.height = `${h}px`
  canvasWidthInput.value = w.toString()
  canvasHeightInput.value = h.toString()
}

presetLandscape.addEventListener('click', () => resizeCanvas(600, 400))
presetPortrait.addEventListener('click', () => resizeCanvas(400, 600))
canvasWidthInput.addEventListener('change', (e) => resizeCanvas(parseInt((e.target as HTMLInputElement).value), parseInt(canvasHeightInput.value)))
canvasHeightInput.addEventListener('change', (e) => resizeCanvas(parseInt(canvasWidthInput.value), parseInt((e.target as HTMLInputElement).value)))

// Canvas Background
canvasBgColor.addEventListener('input', (e) => {
  const color = (e.target as HTMLInputElement).value
  cardCanvas.style.background = color
})

// --- Canvas Drop Logic ---
cardCanvas.addEventListener('dragover', (e) => {
  e.preventDefault()
  e.dataTransfer!.dropEffect = 'copy'
})

cardCanvas.addEventListener('drop', (e) => {
  e.preventDefault()
  const src = e.dataTransfer!.getData('text/plain')
  if (src) {
    createImageElement(src, e.offsetX, e.offsetY)
  }
})

function addResizeHandles(wrapper: HTMLElement) {
  const positions = ['nw', 'ne', 'sw', 'se']
  positions.forEach(pos => {
    const handle = document.createElement('div')
    handle.className = `resize-handle handle-${pos}`
    handle.dataset.pos = pos

    // Resize Logic
    handle.addEventListener('mousedown', (e) => {
      e.stopPropagation()
      e.preventDefault() // Prevent text selection
      initResize(e, wrapper, pos)
    })

    wrapper.appendChild(handle)
  })
}

function createImageElement(src: string, x: number, y: number, width: number = 100, height: number = 100) {
  const wrapper = document.createElement('div')
  wrapper.className = 'canvas-item'
  wrapper.style.left = `${x - 50}px`
  wrapper.style.top = `${y - 50}px`
  wrapper.style.width = `${width}px`
  wrapper.style.height = `${height}px`

  const img = document.createElement('img')
  img.src = src
  img.style.width = '100%'
  img.style.height = '100%'
  img.style.pointerEvents = 'none' // Let clicks pass to wrapper

  wrapper.appendChild(img)
  addResizeHandles(wrapper)
  cardCanvas.appendChild(wrapper)
  makeDraggable(wrapper)
  selectElement(wrapper)
}

function createTextElement() {
  const wrapper = document.createElement('div')
  wrapper.className = 'canvas-item text-item'
  wrapper.style.left = '50px'
  wrapper.style.top = '50px'
  wrapper.contentEditable = 'true'
  wrapper.innerText = 'Merry Christmas!'
  wrapper.style.fontSize = '24px'
  wrapper.style.fontFamily = "'Mountains of Christmas', cursive"
  wrapper.style.color = '#000000'

  addResizeHandles(wrapper)
  cardCanvas.appendChild(wrapper)
  makeDraggable(wrapper)
  selectElement(wrapper)

  wrapper.addEventListener('input', () => updateToolbarPosition(wrapper))
}

// --- Dragging Logic ---
function makeDraggable(el: HTMLElement) {
  let isDragging = false
  let startX = 0
  let startY = 0
  let initialLeft = 0
  let initialTop = 0

  el.addEventListener('mousedown', (e) => {
    if ((e.target as HTMLElement).classList.contains('resize-handle')) return
    e.stopPropagation()
    selectElement(el)
    isDragging = true
    startX = e.clientX
    startY = e.clientY
    initialLeft = el.offsetLeft
    initialTop = el.offsetTop
    el.style.cursor = 'grabbing'
  })

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return
    // Hide toolbar while actually dragging
    floatingToolbar.style.display = 'none'
    const dx = e.clientX - startX
    const dy = e.clientY - startY
    el.style.left = `${initialLeft + dx}px`
    el.style.top = `${initialTop + dy}px`
  })

  window.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false
      el.style.cursor = 'grab'
      showFloatingToolbar(el)
    }
  })
}

// --- Resize Logic ---
function initResize(e: MouseEvent, el: HTMLElement, pos: string) {
  const startX = e.clientX
  const startY = e.clientY
  const startWidth = el.offsetWidth
  const startHeight = el.offsetHeight
  const startLeft = el.offsetLeft
  const startTop = el.offsetTop
  const startFontSize = parseInt(window.getComputedStyle(el).fontSize) || 16
  const isText = el.classList.contains('text-item')

  const onMouseMove = (moveEvent: MouseEvent) => {
    const dx = moveEvent.clientX - startX
    const dy = moveEvent.clientY - startY

    let newWidth = startWidth
    let newHeight = startHeight
    let newLeft = startLeft
    let newTop = startTop

    // Calculate new dimensions and position
    if (pos.includes('e')) newWidth += dx
    if (pos.includes('w')) {
      newWidth -= dx
      newLeft += dx
    }
    if (pos.includes('s')) newHeight += dy
    if (pos.includes('n')) {
      newHeight -= dy
      newTop += dy
    }

    // Apply Width & Left
    if (newWidth > 20) {
      el.style.width = `${newWidth}px`
      if (pos.includes('w')) el.style.left = `${newLeft}px`
    }

    // Apply Height & Top (only for non-text or if we want text box resizing)
    if (!isText && newHeight > 20) {
      el.style.height = `${newHeight}px`
      if (pos.includes('n')) el.style.top = `${newTop}px`
    }

    if (isText) {
      // Scale font size based on width change
      const scale = newWidth / startWidth
      el.style.fontSize = `${startFontSize * scale}px`
      el.style.width = 'auto' // Let text reflow or auto-width
      el.style.height = 'auto'
      updateToolbarPosition(el)
    }
  }

  const onMouseUp = () => {
    window.removeEventListener('mousemove', onMouseMove)
    window.removeEventListener('mouseup', onMouseUp)
  }

  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mouseup', onMouseUp)
}

// --- Selection & Toolbar ---
cardCanvas.addEventListener('click', (e) => {
  if (e.target === cardCanvas) {
    deselectAll()
  }
})

function selectElement(el: HTMLElement) {
  deselectAll()
  selectedElement = el
  el.classList.add('selected')
  showFloatingToolbar(el)
}

function deselectAll() {
  document.querySelectorAll('.selected').forEach(el => el.classList.remove('selected'))
  selectedElement = null
  floatingToolbar.style.display = 'none'
}

function showFloatingToolbar(el: HTMLElement) {
  floatingToolbar.style.display = 'flex'
  // Toggle text controls depending on element type
  const isText = el.classList.contains('text-item')
  textControls.style.display = isText ? 'flex' : 'none'
  // Sync values only for text
  if (isText) {
    floatFont.value = el.style.fontFamily.replace(/"/g, "'")
    floatColor.value = rgbToHex(el.style.color)
  }
  updateToolbarPosition(el)
}

function updateToolbarPosition(el: HTMLElement) {
  const rect = el.getBoundingClientRect()
  const workspaceRect = document.querySelector('.workspace')!.getBoundingClientRect()

  let top = rect.top - workspaceRect.top - 50
  let left = rect.left - workspaceRect.left

  // Flip to bottom if not enough space on top
  if (top < 10) {
    top = rect.bottom - workspaceRect.top + 10
  }

  // Ensure it doesn't go off the left/right edges
  if (left < 10) left = 10
  // Approx toolbar width 200px
  if (left + 200 > workspaceRect.width) {
    left = workspaceRect.width - 210
  }

  floatingToolbar.style.left = `${left}px`
  floatingToolbar.style.top = `${top}px`
}

// --- Toolbar Events ---
floatFont.addEventListener('change', (e) => {
  if (selectedElement && selectedElement.classList.contains('text-item')) {
    selectedElement.style.fontFamily = (e.target as HTMLSelectElement).value
  }
})

floatColor.addEventListener('input', (e) => {
  if (selectedElement && selectedElement.classList.contains('text-item')) {
    selectedElement.style.color = (e.target as HTMLInputElement).value
  }
})

floatDelete.addEventListener('click', () => {
  if (selectedElement) {
    selectedElement.remove()
    deselectAll()
  }
})

// --- Controls ---
addTextBtn.addEventListener('click', createTextElement)

// --- Download ---
downloadBtn.addEventListener('click', async () => {
  deselectAll()
  try {
    const canvas = await html2canvas(cardCanvas, {
      backgroundColor: getComputedStyle(cardCanvas).backgroundColor || '#ffffff',
      scale: 2
    })
    const link = document.createElement('a')
    link.download = 'christmas-card.png'
    link.href = canvas.toDataURL('image/png')
    link.click()
  } catch (err) {
    console.error("Download failed:", err)
  }
})

// Initialize default card content
initTemplate()

// Helper
function rgbToHex(rgb: string) {
  if (!rgb) return '#000000'
  if (rgb.startsWith('#')) return rgb
  const rgbValues = rgb.match(/\d+/g)
  if (!rgbValues) return '#000000'
  return '#' + rgbValues.slice(0, 3).map(x => {
    const hex = parseInt(x).toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }).join('')
}
