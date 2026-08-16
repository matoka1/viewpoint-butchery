// Supabase Configuration - Your Project
const SUPABASE_CONFIG = {
    url: 'https://sipgnykshaxrxwdeswfc.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpcGdueWtzaGF4cnh3ZGVzd2ZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY4OTA2MzMsImV4cCI6MjEwMjQ2NjYzM30.xJtq_3jNMLnXCyVSurdIuUnrlmZEyMWNO1-Azk_4k2E'
};

// Business Configuration
const BUSINESS_CONFIG = {
    name: 'Viewpoint Butchery & Restaurant',
    currency: 'KES',
    receiptFooter: 'Thank you for shopping with Viewpoint!'
};

// Database Tables
const DB_TABLES = {
    users: 'users',
    products: 'products',
    categories: 'categories',
    orders: 'orders',
    orderItems: 'order_items',
    payments: 'payments',
    mpesaTransactions: 'mpesa_transactions',
    inventoryMovements: 'inventory_movements',
    auditLogs: 'audit_logs'
};
