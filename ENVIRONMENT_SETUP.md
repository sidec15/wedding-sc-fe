# Environment Configuration Setup

This project uses Angular environment configuration to manage different API URLs for different environments.

## Environment Files

### Development Environment (`src/environments/environment.ts`)
- Used during development (`ng serve`)
- API URL: `http://localhost:3000/api`

### Production Environment (`src/environments/environment.prod.ts`)
- Used for production builds (`ng build --configuration=production`)
- API URL: `https://matrimonio.chiaraesimone.it/api`

## How It Works

1. **Development**: When you run `ng serve`, Angular uses `environment.ts`
2. **Production**: When you run `ng build --configuration=production`, Angular automatically replaces `environment.ts` with `environment.prod.ts` using file replacements

## Usage in Services

```typescript
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ContactService {
  private apiUrl = `${environment.apiUrl}/contact`;
  
  // ... rest of service
}
```

## Adding New Environment Variables

1. Add the variable to both environment files:
   ```typescript
   // environment.ts
   export const environment = {
     production: false,
     apiUrl: 'http://localhost:3000/api',
     newVariable: 'dev-value'
   };

   // environment.prod.ts
   export const environment = {
     production: true,
     apiUrl: 'https://matrimonio.chiaraesimone.it/api',
     newVariable: 'prod-value'
   };
   ```

2. Use it in your components/services:
   ```typescript
   import { environment } from '../../../../environments/environment';
   
   // Use environment.newVariable
   ```

## Configuration in angular.json

The file replacement is configured in `angular.json`:

```json
"fileReplacements": [
  {
    "replace": "src/environments/environment.ts",
    "with": "src/environments/environment.prod.ts"
  }
]
```

This ensures that during production builds, the development environment file is automatically replaced with the production one. 
