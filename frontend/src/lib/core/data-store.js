import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { IntelligenceEngine } from './intelligence-engine'

// Generate realistic mock data
const generateMockCustomers = () => [
  {
    id: 'cust_1',
    name: 'Rajesh Kumar',
    email: 'rajesh.kumar@email.com',
    ltv: 45000,
    engagement_score: 65,
    purchase_frequency: 2.5,
    last_purchase: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(),
    churn_risk: 0,
    segment: 'enterprise',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 365).toISOString()
  },
  {
    id: 'cust_2',
    name: 'Priya Sharma',
    email: 'priya.sharma@email.com',
    ltv: 32000,
    engagement_score: 45,
    purchase_frequency: 1.8,
    last_purchase: new Date(Date.now() - 1000 * 60 * 60 * 24 * 35).toISOString(),
    churn_risk: 0,
    segment: 'mid-market',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 180).toISOString()
  },
  {
    id: 'cust_3',
    name: 'Amit Patel',
    email: 'amit.patel@email.com',
    ltv: 68000,
    engagement_score: 85,
    purchase_frequency: 3.2,
    last_purchase: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    churn_risk: 0,
    segment: 'enterprise',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 400).toISOString()
  },
  {
    id: 'cust_4',
    name: 'Sneha Reddy',
    email: 'sneha.reddy@email.com',
    ltv: 28000,
    engagement_score: 55,
    purchase_frequency: 2.1,
    last_purchase: new Date(Date.now() - 1000 * 60 * 60 * 24 * 22).toISOString(),
    churn_risk: 0,
    segment: 'mid-market',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 150).toISOString()
  },
  {
    id: 'cust_5',
    name: 'Vikram Singh',
    email: 'vikram.singh@email.com',
    ltv: 52000,
    engagement_score: 75,
    purchase_frequency: 2.8,
    last_purchase: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString(),
    churn_risk: 0,
    segment: 'enterprise',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 280).toISOString()
  }
]

const generateMockProducts = () => [
  {
    id: 'prod_1',
    name: 'Peter England Formal Shirt',
    sku: 'PE-FS-001',
    category: 'mens_formal_wear',
    price: 1899,
    cost: 950,
    stock_quantity: 85,
    sales_velocity: 18,
    demand_score: 0,
    profit_margin: 50,
    reorder_threshold: 30,
    supplier_lead_time: 7,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 120).toISOString()
  },
  {
    id: 'prod_2',
    name: 'Van Heusen Premium Suit',
    sku: 'VH-PS-002',
    category: 'mens_formal_wear',
    price: 8999,
    cost: 4500,
    stock_quantity: 25,
    sales_velocity: 6,
    demand_score: 0,
    profit_margin: 50,
    reorder_threshold: 15,
    supplier_lead_time: 14,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 90).toISOString()
  },
  {
    id: 'prod_3',
    name: 'FabIndia Cotton Kurta',
    sku: 'FI-CK-003',
    category: 'ethnic_wear',
    price: 1299,
    cost: 650,
    stock_quantity: 120,
    sales_velocity: 24,
    demand_score: 0,
    profit_margin: 50,
    reorder_threshold: 40,
    supplier_lead_time: 10,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60).toISOString()
  },
  {
    id: 'prod_4',
    name: 'Biba Designer Salwar Kameez',
    sku: 'BI-DS-004',
    category: 'ethnic_wear',
    price: 2499,
    cost: 1250,
    stock_quantity: 65,
    sales_velocity: 15,
    demand_score: 0,
    profit_margin: 50,
    reorder_threshold: 25,
    supplier_lead_time: 12,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 45).toISOString()
  },
  {
    id: 'prod_5',
    name: 'Allen Solly Casual T-Shirt',
    sku: 'AS-CT-005',
    category: 'mens_casual_wear',
    price: 899,
    cost: 450,
    stock_quantity: 150,
    sales_velocity: 32,
    demand_score: 0,
    profit_margin: 50,
    reorder_threshold: 50,
    supplier_lead_time: 5,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString()
  },
  {
    id: 'prod_6',
    name: 'Levi\'s 501 Jeans',
    sku: 'LV-501-006',
    category: 'mens_casual_wear',
    price: 3499,
    cost: 1750,
    stock_quantity: 95,
    sales_velocity: 22,
    demand_score: 0,
    profit_margin: 50,
    reorder_threshold: 35,
    supplier_lead_time: 8,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 75).toISOString()
  },
  {
    id: 'prod_7',
    name: 'Zara Women\'s Summer Dress',
    sku: 'ZA-WD-007',
    category: 'womens_western',
    price: 2799,
    cost: 1400,
    stock_quantity: 70,
    sales_velocity: 19,
    demand_score: 0,
    profit_margin: 50,
    reorder_threshold: 30,
    supplier_lead_time: 9,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 55).toISOString()
  },
  {
    id: 'prod_8',
    name: 'H&M Basic Cotton Top',
    sku: 'HM-BT-008',
    category: 'womens_western',
    price: 699,
    cost: 350,
    stock_quantity: 180,
    sales_velocity: 38,
    demand_score: 0,
    profit_margin: 50,
    reorder_threshold: 60,
    supplier_lead_time: 4,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 25).toISOString()
  },
  {
    id: 'prod_9',
    name: 'Raymond Blazer',
    sku: 'RY-BL-009',
    category: 'mens_formal_wear',
    price: 5999,
    cost: 3000,
    stock_quantity: 35,
    sales_velocity: 8,
    demand_score: 0,
    profit_margin: 50,
    reorder_threshold: 20,
    supplier_lead_time: 15,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 100).toISOString()
  },
  {
    id: 'prod_10',
    name: 'W For Women Ethnic Gown',
    sku: 'WF-EG-010',
    category: 'ethnic_wear',
    price: 3299,
    cost: 1650,
    stock_quantity: 45,
    sales_velocity: 12,
    demand_score: 0,
    profit_margin: 50,
    reorder_threshold: 20,
    supplier_lead_time: 11,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 40).toISOString()
  },
  {
    id: 'prod_11',
    name: 'Flying Machine Cargo Pants',
    sku: 'FM-CP-011',
    category: 'mens_casual_wear',
    price: 1599,
    cost: 800,
    stock_quantity: 110,
    sales_velocity: 25,
    demand_score: 0,
    profit_margin: 50,
    reorder_threshold: 40,
    supplier_lead_time: 6,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 35).toISOString()
  },
  {
    id: 'prod_12',
    name: 'Global Desi Indo-Western Dress',
    sku: 'GD-IW-012',
    category: 'womens_western',
    price: 1899,
    cost: 950,
    stock_quantity: 80,
    sales_velocity: 20,
    demand_score: 0,
    profit_margin: 50,
    reorder_threshold: 35,
    supplier_lead_time: 7,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 50).toISOString()
  },
  {
    id: 'prod_13',
    name: 'Manyavar Sherwani',
    sku: 'MV-SW-013',
    category: 'ethnic_wear',
    price: 8999,
    cost: 4500,
    stock_quantity: 20,
    sales_velocity: 4,
    demand_score: 0,
    profit_margin: 50,
    reorder_threshold: 10,
    supplier_lead_time: 20,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 110).toISOString()
  },
  {
    id: 'prod_14',
    name: 'Park Avenue Polo T-Shirt',
    sku: 'PA-PT-014',
    category: 'mens_casual_wear',
    price: 1299,
    cost: 650,
    stock_quantity: 130,
    sales_velocity: 28,
    demand_score: 0,
    profit_margin: 50,
    reorder_threshold: 45,
    supplier_lead_time: 5,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 28).toISOString()
  },
  {
    id: 'prod_15',
    name: 'Aurelia Women\'s Kurti',
    sku: 'AU-WK-015',
    category: 'ethnic_wear',
    price: 999,
    cost: 500,
    stock_quantity: 160,
    sales_velocity: 35,
    demand_score: 0,
    profit_margin: 50,
    reorder_threshold: 55,
    supplier_lead_time: 6,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString()
  }
]

const generateMockOrders = () => [
  {
    id: 'order_1',
    customer_id: 'cust_1',
    product_id: 'prod_1',
    quantity: 2,
    revenue: 3798,
    profit: 1898,
    status: 'completed',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString()
  },
  {
    id: 'order_2',
    customer_id: 'cust_3',
    product_id: 'prod_2',
    quantity: 1,
    revenue: 8999,
    profit: 4499,
    status: 'completed',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString()
  },
  {
    id: 'order_3',
    customer_id: 'cust_2',
    product_id: 'prod_3',
    quantity: 3,
    revenue: 3897,
    profit: 1947,
    status: 'completed',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString()
  },
  {
    id: 'order_4',
    customer_id: 'cust_1',
    product_id: 'prod_6',
    quantity: 1,
    revenue: 3499,
    profit: 1749,
    status: 'completed',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString()
  },
  {
    id: 'order_5',
    customer_id: 'cust_3',
    product_id: 'prod_4',
    quantity: 2,
    revenue: 4998,
    profit: 2498,
    status: 'completed',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString()
  },
  {
    id: 'order_6',
    customer_id: 'cust_2',
    product_id: 'prod_8',
    quantity: 4,
    revenue: 2796,
    profit: 1396,
    status: 'completed',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString()
  }
]

export const useDataStore = create(subscribeWithSelector((set, get) => ({
  // Core data
  customers: generateMockCustomers(),
  products: generateMockProducts(),
  orders: generateMockOrders(),
  campaigns: [],
  actions: [],
  workflows: [],
  insights: [],
  execution_logs: [],
  
  // System state
  metrics: {
    total_customers: 5,
    total_products: 15,
    total_revenue: 27987,
    total_profit: 13987,
    active_workflows: 0,
    pending_actions: 0,
    executed_actions: 0,
    system_health: 100,
    time_saved_hours: 0,
    confidence_score: 100,
    last_updated: new Date().toISOString()
  },
  isLoading: false,
  lastSync: new Date().toISOString(),
  
  // Actions
  addCustomer: (customer) => set((state) => ({ 
    customers: [...state.customers, customer] 
  })),
  
  updateCustomer: (id, updates) => set((state) => ({
    customers: state.customers.map(c => c.id === id ? { ...c, ...updates } : c)
  })),
  
  addProduct: (product) => set((state) => ({ 
    products: [...state.products, product] 
  })),
  
  updateProduct: (id, updates) => set((state) => ({
    products: state.products.map(p => p.id === id ? { ...p, ...updates } : p)
  })),
  
  addOrder: (order) => set((state) => ({ 
    orders: [...state.orders, order] 
  })),
  
  executeAction: async (actionId, editedContent) => {
    set(state => ({
      actions: state.actions.map(a => 
        a.id === actionId 
          ? { ...a, status: 'executed', executed_at: new Date().toISOString(), edited_content: editedContent } 
          : a
      )
    }))
    
    // Recalculate metrics after action execution
    get().updateMetrics()
  },
  
  rejectAction: (actionId) => {
    set(state => ({
      actions: state.actions.map(a => 
        a.id === actionId ? { ...a, status: 'rejected' } : a
      )
    }))
  },
  
  rollbackAction: (actionId) => {
    set(state => ({
      actions: state.actions.map(a => 
        a.id === actionId ? { ...a, status: 'rolled_back' } : a
      )
    }))
  },
  
  generateInsights: () => {
    const { customers, products, orders, campaigns } = get()
    const insights = IntelligenceEngine.generateInsights(customers, products, orders, campaigns)
    set({ insights })
    
    // Automatically generate actions from new insights
    get().generateActions()
  },
  
  generateActions: () => {
    const { insights } = get()
    const actions = IntelligenceEngine.generateActions(insights)
    
    // Only add new actions that don't already exist (deduplication)
    set(state => {
      const existingIds = new Set(state.actions.map(a => a.id))
      const newActions = actions.filter(a => !existingIds.has(a.id))
      return { actions: [...state.actions, ...newActions] }
    })
    
    get().updateMetrics()
  },
  
  updateMetrics: () => {
    const { customers, products, orders, actions, workflows } = get()
    const metrics = IntelligenceEngine.calculateSystemMetrics(customers, products, orders, actions, workflows)
    set({ metrics })
  },
  
  simulateRealTimeData: () => {
    // Simulate a new order coming in
    const { products, customers } = get()
    if (products.length === 0 || customers.length === 0) return
    
    const randomProduct = products[Math.floor(Math.random() * products.length)]
    const randomCustomer = customers[Math.floor(Math.random() * customers.length)]
    
    const quantity = Math.floor(Math.random() * 3) + 1
    const revenue = randomProduct.price * quantity
    const profit = (randomProduct.price - randomProduct.cost) * quantity
    
    const newOrder = {
      id: `order_${Date.now()}`,
      customer_id: randomCustomer.id,
      product_id: randomProduct.id,
      quantity,
      revenue,
      profit,
      status: 'completed',
      created_at: new Date().toISOString()
    }
    
    get().addOrder(newOrder)
    
    // Update product stock
    get().updateProduct(randomProduct.id, {
      stock_quantity: Math.max(0, randomProduct.stock_quantity - quantity),
      sales_velocity: randomProduct.sales_velocity + quantity
    })
    
    // Update customer stats
    get().updateCustomer(randomCustomer.id, {
      last_purchase: new Date().toISOString(),
      ltv: randomCustomer.ltv + profit
    })
    
    // Trigger intelligence engine update
    get().generateInsights()
  }
})))
