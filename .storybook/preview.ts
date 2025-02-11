import type { Preview } from "@storybook/react";
import '../app/globals.css';

const preview: Preview = {
  parameters: {
    actions: {
      handleLogin: { fn: (args) => console.log("Login:", args) },
      handleLogout: { fn: (args) => console.log("Logout:", args) },
      handleRegister: { fn: (args) => console.log("Register:", args) },
      handlePost: { fn: (args) => console.log("Post:", args) },
      handleDelete: { fn: (args) => console.log("Delete:", args) },
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      disable: true,
      grid: {
        disable: true
      }
    },
    docs: {
      story: {
        inline: true,
      },
    },
  },
};

export default preview;
