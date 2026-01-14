declare const config: {
  theme: {
    colors: {
      transparent: string;
      current: string;
      brand: Record<string, string>;
      primary: Record<string, string>;
      secondary: Record<string, string>;
      base: Record<string, string>;
      blue: Record<string, string>;
      red: Record<string, string>;
      yellow: Record<string, string>;
      pink: Record<string, string>;
      green: Record<string, string>;
      purple: Record<string, string>;
      emerald: Record<string, string>;
      coral: Record<string, string>;
      white: Record<string, string>;
      black: Record<string, string>;
      button: Record<string, string>;
      gray: Record<string, string>;
      indigo: Record<string, string>;
    };
    fontFamily: {
      jakarta: string[];
      sans: string[];
      serif: string[];
      mono: string[];
    };
    [key: string]: any;
  };
  [key: string]: any;
};

export default config;
