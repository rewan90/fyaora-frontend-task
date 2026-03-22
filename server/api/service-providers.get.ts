// Mock data API for service providers
const firstNames = ['James', 'Emma', 'Oliver', 'Sophia', 'William', 'Ava', 'Benjamin', 'Isabella', 'Lucas', 'Mia', 'Henry', 'Charlotte', 'Alexander', 'Amelia', 'Daniel', 'Harper', 'Matthew', 'Evelyn', 'Joseph', 'Abigail']
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Anderson', 'Taylor', 'Thomas', 'Hernandez', 'Moore', 'Martin', 'Jackson', 'Thompson', 'White', 'Lopez']
const companies = ['CleanPro Solutions', 'Sparkle Services', 'Premier Cleaning Co', 'BrightHome Ltd', 'Crystal Clear Services', 'HomeShine Group', 'Elite Maintenance', 'GreenClean UK', 'SwiftService Ltd', 'TopNotch Cleaning']
const postcodes = ['SW1A 1AA', 'M1 1AE', 'OX1 2JD', 'EC1A 1BB', 'W1A 0AX', 'B1 1BB', 'LS1 1UR', 'EH1 1YZ', 'CF10 1EP', 'BS1 1HT', 'NE1 4ST', 'SO14 7DU', 'NG1 5FW', 'LE1 1WB', 'CB2 1TN', 'PO1 2UP', 'BA1 1SU', 'YO1 9TL', 'GL1 1DG', 'EX1 1HS']
const emailDomains = ['gmail.com', 'app.com', 'outlook.com', 'yahoo.co.uk', 'hotmail.com', 'protonmail.com', 'cleanpro.com', 'sparkle.co.uk', 'service.io']
const vendorTypes = ['Independent', 'Company']
const serviceOfferings = ['Housekeeping', 'Window Cleaning', 'Car Valet']
const statuses = ['Onboarded', 'Rejected', '-']
const countries = ['United Kingdom', 'United Kingdom', 'United Kingdom', 'Ireland', 'United Kingdom']

function generatePhone(): string {
  const prefix = '+44 20 7946'
  const suffix = String(Math.floor(1000 + Math.random() * 9000))
  return `${prefix} ${suffix}`
}

function generateDate(startYear: number, endYear: number): string {
  const year = startYear + Math.floor(Math.random() * (endYear - startYear + 1))
  const month = String(Math.floor(1 + Math.random() * 12)).padStart(2, '0')
  const day = String(Math.floor(1 + Math.random() * 28)).padStart(2, '0')
  return `${day}/${month}/${year}`
}

interface ServiceProvider {
  id: number
  email: string
  phoneNumber: string
  postcode: string
  vendorType: string
  serviceOffering: string
  signupDate: string
  status: string
  companyName: string
  contactEmail: string
  contactPhone: string
  country: string
  customerType: string
  services: string[]
  notes: string
}

function generateProviders(): ServiceProvider[] {
  const providers: ServiceProvider[] = []

  for (let i = 1; i <= 55; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
    const vendorType = vendorTypes[Math.floor(Math.random() * vendorTypes.length)]
    const companyName = vendorType === 'Company'
      ? companies[Math.floor(Math.random() * companies.length)]
      : `${firstName} ${lastName}`
    const emailDomain = emailDomains[Math.floor(Math.random() * emailDomains.length)]
    const email = vendorType === 'Company'
      ? `${companyName.split(' ')[0].toLowerCase()}@${emailDomain}`
      : `${firstName.toLowerCase()}${lastName.toLowerCase()}@${emailDomain}`

    const numServices = 1 + Math.floor(Math.random() * 2)
    const shuffled = [...serviceOfferings].sort(() => 0.5 - Math.random())
    const services = shuffled.slice(0, numServices)

    providers.push({
      id: i,
      email,
      phoneNumber: generatePhone(),
      postcode: postcodes[Math.floor(Math.random() * postcodes.length)],
      vendorType,
      serviceOffering: services[0],
      signupDate: generateDate(2022, 2025),
      status: statuses[Math.floor(Math.random() * statuses.length)],
      companyName,
      contactEmail: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.com`,
      contactPhone: generatePhone(),
      country: countries[Math.floor(Math.random() * countries.length)],
      customerType: vendorType === 'Company' ? 'Customer' : 'individual',
      services,
      notes: ''
    })
  }

  return providers
}

// Generate once and cache
let cachedProviders: ServiceProvider[] | null = null

export default defineEventHandler((event) => {
  if (!cachedProviders) {
    cachedProviders = generateProviders()
  }

  const query = getQuery(event)

  let filtered = [...cachedProviders]

  // Search filter
  if (query.search) {
    const search = String(query.search).toLowerCase().trim()
    filtered = filtered.filter(p =>
      p.email.toLowerCase().includes(search) ||
      p.phoneNumber.toLowerCase().includes(search) ||
      p.postcode.toLowerCase().includes(search) ||
      p.vendorType.toLowerCase().includes(search) ||
      p.serviceOffering.toLowerCase().includes(search) ||
      p.companyName.toLowerCase().includes(search)
    )
  }

  // Postcode filter
  if (query.postcode) {
    const pc = String(query.postcode).toLowerCase().trim()
    filtered = filtered.filter(p => p.postcode.toLowerCase().includes(pc))
  }

  // Status filter
  if (query.status) {
    const statusList = String(query.status).split(',')
    filtered = filtered.filter(p => statusList.includes(p.status))
  }

  // Vendor type filter
  if (query.vendorType) {
    const vtList = String(query.vendorType).split(',')
    filtered = filtered.filter(p => vtList.includes(p.vendorType))
  }

  // Service offering filter
  if (query.serviceOffering) {
    const soList = String(query.serviceOffering).split(',')
    filtered = filtered.filter(p => soList.includes(p.serviceOffering))
  }

  // Date range filter
  if (query.startDate || query.endDate) {
    filtered = filtered.filter(p => {
      const parts = p.signupDate.split('/')
      const date = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]))
      if (query.startDate) {
        const start = new Date(String(query.startDate))
        if (date < start) return false
      }
      if (query.endDate) {
        const end = new Date(String(query.endDate))
        if (date > end) return false
      }
      return true
    })
  }

  // Sorting
  if (query.sortBy) {
    const sortBy = String(query.sortBy) as keyof ServiceProvider
    const sortDir = query.sortDir === 'desc' ? -1 : 1
    filtered.sort((a, b) => {
      const aVal = String(a[sortBy] ?? '').toLowerCase()
      const bVal = String(b[sortBy] ?? '').toLowerCase()
      if (aVal < bVal) return -1 * sortDir
      if (aVal > bVal) return 1 * sortDir
      return 0
    })
  }

  // Pagination
  const page = parseInt(String(query.page || '1'))
  const perPage = parseInt(String(query.perPage || '10'))
  const total = filtered.length
  const totalPages = Math.ceil(total / perPage)
  const start = (page - 1) * perPage
  const paginatedData = filtered.slice(start, start + perPage)

  return {
    data: paginatedData,
    meta: {
      total,
      page,
      perPage,
      totalPages
    }
  }
})
