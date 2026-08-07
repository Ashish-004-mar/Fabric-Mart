const fs = require('fs');
let content = fs.readFileSync('src/components/FabricMartCopilotModal.tsx', 'utf8');

const updatedCheckNav = `
  // Check for voice-triggered navigation commands
  const checkNavigationCommand = (rawQuery: string) => {
    const q = rawQuery.toLowerCase().trim();

    // 1. Orders / Dashboard / Track Order
    if (q.includes('order') || q.includes('my orders') || q.includes('track') || q.includes('order history') || q.includes('take me to my orders') || q.includes('show my orders')) {
      if (!user) {
        return {
          isNav: true,
          targetTab: 'auth',
          reply: \`Please log in or register to track your orders.\`
        };
      }
      const targetTab = isSeller ? 'supplier-dashboard' : 'buyer-dashboard';
      return {
        isNav: true,
        targetTab,
        reply: \`Certainly! Navigating you directly to your \${isSeller ? 'Mill Orders & Sales' : 'Orders'} page.\`
      };
    }
    
    // 1.1 Address Update / Settings
    if (q.includes('address') || q.includes('update address') || q.includes('shipping address') || q.includes('profile settings') || q.includes('account settings')) {
      if (!user) {
        return {
          isNav: true,
          targetTab: 'auth',
          reply: \`Please log in to update your account settings.\`
        };
      }
      const targetTab = isSeller ? 'supplier-dashboard' : 'buyer-dashboard';
      return {
        isNav: true,
        targetTab,
        reply: \`Navigating you to your Profile Settings. You can update your shipping address there.\`
      };
    }
    
    // 1.2 Returns
    if (q.includes('return') || q.includes('defective') || q.includes('refund')) {
      if (!user) {
        return {
          isNav: true,
          targetTab: 'auth',
          reply: \`Please log in to manage your returns.\`
        };
      }
      const targetTab = isSeller ? 'supplier-dashboard' : 'buyer-dashboard';
      return {
        isNav: true,
        targetTab,
        reply: \`I'll take you to your dashboard where you can request a return for your recent orders.\`
      };
    }

    // 2. Search for fabric (e.g. "search for silk fabrics", "search silk", "find organic linen")
`;

content = content.replace(/\/\/ Check for voice-triggered navigation commands[\s\S]*?\/\/ 2\. Search for fabric \(e\.g\. "search for silk fabrics", "search silk", "find organic linen"\)/, updatedCheckNav.trim() + '\n    // 2. Search for fabric (e.g. "search for silk fabrics", "search silk", "find organic linen")');

fs.writeFileSync('src/components/FabricMartCopilotModal.tsx', content);
