# Telegram Mini Apps Repository Analysis

## Overview

This document provides a comprehensive analysis of the `telegram-apps` monorepo structure and key components.

## Repository Structure

The repository is organized as a monorepo with the following main directories:

- **packages/** - Core libraries and utilities
- **apps/** - Applications (documentation)
- **playgrounds/** - Examples and test applications
- **wip/** - Work in progress features

## Key Packages

### Core SDK Packages

1. **@telegram-apps/sdk** - Main TypeScript SDK
   - Modular architecture with components
   - Reactive signals system
   - Support for ESM, CJS, IIFE formats

2. **@telegram-apps/bridge** - Communication layer
   - Handles events from Telegram
   - Sends methods to Telegram
   - Version-based method support validation

3. **@telegram-apps/signals** - Reactive system
   - Lightweight reactive signals
   - Computed signals support
   - Batch updates

### Framework Integrations

- **@telegram-apps/sdk-react** - React hooks
- **@telegram-apps/sdk-vue** - Vue composables  
- **@telegram-apps/sdk-solid** - Solid.js integration
- **@telegram-apps/sdk-svelte** - Svelte integration

### Development Tools

- **@telegram-apps/create-mini-app** - CLI tool for project creation
- **@telegram-apps/init-data-node** - Server-side init data validation
- **@telegram-apps/types** - TypeScript type definitions

## Key Components

### UI Components
- MainButton - Primary action button
- BackButton - Navigation back button
- SecondaryButton - Secondary action button
- SettingsButton - Settings access button
- Popup - Modal dialogs
- Viewport - View area management

### Functional Components
- InitData - Initialization data handling
- ThemeParams - Theme configuration
- HapticFeedback - Tactile feedback
- CloudStorage - Cloud data storage
- Biometry - Biometric authentication
- QRScanner - QR code scanning

## Architecture Patterns

### Component Lifecycle
1. Mount component with `mount()` method
2. Configure properties with `setParams()`
3. Subscribe to state changes via signals
4. Unmount when no longer needed

### Reactive State Management
- Uses custom signals system
- Framework-agnostic reactive primitives
- Automatic UI updates on state changes

### Safety and Compatibility
- Method support checking by Telegram version
- Safe wrappers for unsupported environments
- Graceful degradation

## Development Setup

- **Build System**: Turbo (monorepo) + Vite
- **Language**: TypeScript
- **Package Manager**: pnpm
- **Testing**: Vitest
- **Linting**: ESLint

## Advantages Over Official SDK

1. TypeScript support out of the box
2. Modular architecture vs monolithic file
3. Modern package formats (ESM, CJS, IIFE)
4. Framework integrations
5. Proper security configuration
6. State persistence across reloads
7. Version-aware method support
8. Open source with community contributions

## Usage Examples

### Basic Initialization
```typescript
import { init } from '@telegram-apps/sdk';
init();
```

### Component Usage
```typescript
import { mainButton } from '@telegram-apps/sdk';

if (mainButton.mount.isAvailable()) {
  mainButton.mount();
  mainButton.setParams({
    text: 'Click me!',
    isVisible: true,
    isEnabled: true
  });
}
```

### React Integration
```typescript
import { useSignal } from '@telegram-apps/sdk-react';
import { mainButton } from '@telegram-apps/sdk';

function MyComponent() {
  const isVisible = useSignal(mainButton.isVisible);
  return <div>Button is {isVisible ? 'visible' : 'hidden'}</div>;
}
```

## Documentation

Comprehensive documentation is available in the `/apps/docs` directory with:
- API references
- Usage guides
- Migration guides
- Multi-language support

This analysis was conducted on July 29, 2025.