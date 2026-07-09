import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const mockDbPlugin = () => ({
  name: 'mock-db-plugin',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      if (req.url.startsWith('/api/sync-returns')) {
        const filePath = path.resolve(__dirname, '../../shared_returns_db.json');
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Headers', '*');
        res.setHeader('Access-Control-Allow-Methods', '*');
        
        if (req.method === 'OPTIONS') {
          res.statusCode = 200;
          res.end();
          return;
        }
        
        const getDb = () => {
          let defaultDb = {
            balances: {
              user: 5000,
              admin: 120000
            },
            orders: {},
            transactions: []
          };
          if (fs.existsSync(filePath)) {
            try {
              return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
            } catch (e) {
              return defaultDb;
            }
          }
          return defaultDb;
        };

        if (req.method === 'GET') {
          res.statusCode = 200;
          res.end(JSON.stringify(getDb()));
        } else if (req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => {
            try {
              let incoming = JSON.parse(body);
              let db = getDb();
              if (incoming.reset) {
                db = {
                  balances: { user: 5000, admin: 120000 },
                  orders: {},
                  transactions: []
                };
              } else {
                db = {
                  balances: { ...db.balances, ...incoming.balances },
                  orders: { ...db.orders, ...incoming.orders },
                  transactions: incoming.transactions ? [...db.transactions, ...incoming.transactions] : db.transactions
                };
              }
              fs.writeFileSync(filePath, JSON.stringify(db, null, 2), 'utf-8');
              res.statusCode = 200;
              res.end(JSON.stringify(db));
            } catch (e) {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: e.message }));
            }
          });
        }
      } else {
        next();
      }
    });
  }
});

export default defineConfig({
  plugins: [react(), tailwindcss(), mockDbPlugin()],
  server: { 
    port: 5173,
    watch: {
      ignored: ['**/public/**']
    }
  },
});
