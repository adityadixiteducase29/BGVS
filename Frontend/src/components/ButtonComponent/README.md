# ButtonComponent

A customizable button component that wraps Reactstrap's Button with enhanced styling and color options.

## Features

- 🎨 **Customizable Colors**: Set custom background and text colors
- 🎯 **Predefined Variants**: Use built-in color schemes (primary, secondary, success, etc.)
- 📏 **Multiple Sizes**: Small, default, and large button sizes
- 🖱️ **Hover Effects**: Smooth transitions and hover animations
- ♿ **Accessibility**: Proper focus states and keyboard navigation
- 🎭 **Flexible Styling**: Combine with custom CSS classes

## Installation

The component is available in your components directory. Import it like this:

```jsx
import ButtonComponent from "@/components/ButtonComponent";
```

## Basic Usage

### Default Button (Primary)
```jsx
<ButtonComponent>
  Click Me
</ButtonComponent>
```

### With Custom Colors
```jsx
<ButtonComponent 
  backgroundColor="#FF6B6B" 
  textColor="#FFFFFF"
>
  Custom Red Button
</ButtonComponent>
```

### With Variants
```jsx
<ButtonComponent variant="success">
  Success Button
</ButtonComponent>

<ButtonComponent variant="danger">
  Danger Button
</ButtonComponent>

<ButtonComponent variant="outline">
  Outline Button
</ButtonComponent>
```

### With Sizes
```jsx
<ButtonComponent size="sm">Small</ButtonComponent>
<ButtonComponent size="default">Default</ButtonComponent>
<ButtonComponent size="lg">Large</ButtonComponent>
```

### With Icons
```jsx
import { PlusCircle } from 'lucide-react';

<ButtonComponent>
  <PlusCircle size={16} />
  Add Item
</ButtonComponent>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | **Required** | Button content (text, icons, etc.) |
| `backgroundColor` | `string` | `undefined` | Custom background color (hex, rgb, etc.) |
| `textColor` | `string` | `undefined` | Custom text color (hex, rgb, etc.) |
| `size` | `'sm' \| 'default' \| 'lg'` | `'default'` | Button size |
| `variant` | `'primary' \| 'secondary' \| 'success' \| 'danger' \| 'warning' \| 'info' \| 'light' \| 'dark' \| 'outline'` | `'primary'` | Predefined color scheme |
| `className` | `string` | `''` | Additional CSS classes |
| `...props` | `any` | - | All other Reactstrap Button props |

## Color Priority

1. **Custom Colors**: If `backgroundColor` or `textColor` are provided, they take precedence
2. **Variants**: If no custom colors, the `variant` prop determines the appearance
3. **Defaults**: If neither custom colors nor variant, uses primary colors

## Available Variants

- **`primary`**: Uses `--primary` CSS variable with white text
- **`secondary`**: Uses `--secondary` CSS variable
- **`success`**: Green background (`#10B981`) with white text
- **`danger`**: Red background (`#EF4444`) with white text
- **`warning`**: Orange background (`#F59E0B`) with white text
- **`info`**: Blue background (`#3B82F6`) with white text
- **`light`**: Light gray background (`#F3F4F6`) with dark text
- **`dark`**: Dark background (`#111827`) with white text
- **`outline`**: Transparent background with primary border and text

## Examples

### Form Buttons
```jsx
<div className="flex gap-2">
  <ButtonComponent variant="outline" onClick={handleCancel}>
    Cancel
  </ButtonComponent>
  <ButtonComponent variant="primary" onClick={handleSave}>
    Save Changes
  </ButtonComponent>
</div>
```

### Action Buttons
```jsx
<div className="flex gap-2">
  <ButtonComponent variant="success" size="sm">
    <CheckCircle size={16} />
    Approve
  </ButtonComponent>
  <ButtonComponent variant="danger" size="sm">
    <X size={16} />
    Reject
  </ButtonComponent>
</div>
```

### Custom Brand Colors
```jsx
<ButtonComponent 
  backgroundColor="#1DA1F2" 
  textColor="#FFFFFF"
  onClick={handleTwitterShare}
>
  <Twitter size={16} />
  Share on Twitter
</ButtonComponent>
```

## Styling

The component includes:
- **Hover Effects**: Smooth opacity and transform animations
- **Focus States**: Accessible focus indicators
- **Active States**: Click feedback
- **Disabled States**: Proper disabled styling
- **Responsive Design**: Works on all screen sizes

## CSS Classes

The component automatically applies these CSS classes:
- `.custom-button`: Base button styles
- `.button-{size}`: Size-specific styles
- `.button-{variant}`: Variant-specific styles

## File Structure

```
ButtonComponent/
├── index.jsx              # Main component file
├── ButtonComponent.css    # Component styles
└── README.md             # This documentation
```

## Dependencies

- React
- Reactstrap
- PropTypes
- Custom CSS (ButtonComponent.css)

## Notes

- When using custom colors, the component will override variant styles
- The component passes through all Reactstrap Button props
- Hover effects are handled via CSS for better performance
- Focus states follow accessibility best practices
- All styles use CSS variables for consistency with your design system
