import * as vscode from "vscode";

interface ThemeCustomization {
  accentColor: string;
  backgroundColor: string;
  keywordColor: string;
  stringColor: string;
  functionColor: string;
}

interface CustomizationOption {
  key: keyof ThemeCustomization;
  label: string;
  description: string;
}

interface ThemeInfo {
  label: string;
  configKey: string;
  type: "light" | "dark";
  defaultForeground: string;
}

const THEMES: ThemeInfo[] = [
  { label: "Ivory Light", configKey: "ivory", type: "light", defaultForeground: "#3C3C3C" },
  { label: "Material HC Dark", configKey: "materialHC", type: "dark", defaultForeground: "#EEFFFF" },
  { label: "Material Default High Contrast", configKey: "materialDefaultHC", type: "dark", defaultForeground: "#EEFFFF" },
  { label: "Sky Light", configKey: "skyLight", type: "light", defaultForeground: "#2C3E50" },
  { label: "Pink Blossom", configKey: "pinkBlossom", type: "light", defaultForeground: "#3C2A33" },
];

const CUSTOMIZATION_OPTIONS: CustomizationOption[] = [
  {
    key: "accentColor",
    label: "$(paintcan) Accent Color",
    description: "Status bar, badges, highlights",
  },
  {
    key: "backgroundColor",
    label: "$(window) Background Color",
    description: "Editor background",
  },
  {
    key: "keywordColor",
    label: "$(symbol-keyword) Keyword Color",
    description: "if, else, return, const, etc.",
  },
  {
    key: "stringColor",
    label: "$(quote) String Color",
    description: "String literals",
  },
  {
    key: "functionColor",
    label: "$(symbol-method) Function Color",
    description: "Function and method names",
  },
];

function getActiveTheme(): ThemeInfo | null {
  const activeThemeId = vscode.workspace
    .getConfiguration("workbench")
    .get<string>("colorTheme");
  return THEMES.find((t) => t.label === activeThemeId) ?? null;
}

function getConfig(theme: ThemeInfo): ThemeCustomization {
  const config = vscode.workspace.getConfiguration("vellumTheme");
  return {
    accentColor: config.get(`${theme.configKey}.accentColor`) as string,
    backgroundColor: config.get(`${theme.configKey}.backgroundColor`) as string,
    keywordColor: config.get(`${theme.configKey}.keywordColor`) as string,
    stringColor: config.get(`${theme.configKey}.stringColor`) as string,
    functionColor: config.get(`${theme.configKey}.functionColor`) as string,
  };
}

function buildColorCustomizations(
  theme: ThemeInfo,
  customization: ThemeCustomization
): Record<string, Record<string, string>> {
  const bg = customization.backgroundColor;
  const isLight = theme.type === "light";

  const colorCustomizations: Record<string, string> = {
    "statusBar.background": customization.accentColor,
    "statusBar.foreground": isLight ? "#FFFFFF" : "#000000",
    "activityBarBadge.background": customization.accentColor,
    "editorLink.activeForeground": customization.accentColor,
    "button.background": customization.accentColor,
    "progressBar.background": customization.accentColor,
    "editor.background": bg,
    "editor.foreground": theme.defaultForeground,
    "sideBar.background": isLight
      ? adjustBrightness(bg, -10)
      : adjustBrightness(bg, 5),
    "editorGroupHeader.tabsBackground": isLight
      ? adjustBrightness(bg, -5)
      : adjustBrightness(bg, 3),
    "tab.activeBackground": bg,
  };

  return { [`[${theme.label}]`]: colorCustomizations };
}

function buildTokenColorCustomizations(
  theme: ThemeInfo,
  customization: ThemeCustomization
): Record<string, unknown> {
  return {
    [`[${theme.label}]`]: {
      textMateRules: [
        {
          scope: [
            "keyword",
            "keyword.control",
            "keyword.operator",
            "storage.type",
            "storage.modifier",
          ],
          settings: { foreground: customization.keywordColor },
        },
        {
          scope: [
            "string",
            "string.quoted",
            "string.template",
            "string.interpolated",
          ],
          settings: { foreground: customization.stringColor },
        },
        {
          scope: [
            "entity.name.function",
            "meta.function-call",
            "support.function",
          ],
          settings: { foreground: customization.functionColor },
        },
      ],
    },
  };
}

function adjustBrightness(hex: string, amount: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + amount));
  const b = Math.min(255, Math.max(0, (num & 0xff) + amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

function isValidHex(value: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(value);
}

async function applyCustomizations(theme: ThemeInfo): Promise<void> {
  const customization = getConfig(theme);
  const colorCustomizations = buildColorCustomizations(theme, customization);
  const tokenColorCustomizations = buildTokenColorCustomizations(
    theme,
    customization
  );

  const config = vscode.workspace.getConfiguration("workbench");
  const existing =
    config.get<Record<string, unknown>>("colorCustomizations") ?? {};

  await config.update(
    "colorCustomizations",
    { ...existing, ...colorCustomizations },
    vscode.ConfigurationTarget.Global
  );

  const editorConfig = vscode.workspace.getConfiguration("editor");
  const existingTokenColors =
    editorConfig.get<Record<string, unknown>>("tokenColorCustomizations") ?? {};

  await editorConfig.update(
    "tokenColorCustomizations",
    { ...existingTokenColors, ...tokenColorCustomizations },
    vscode.ConfigurationTarget.Global
  );

  vscode.window.showInformationMessage(
    `Theme customizations applied for ${theme.label}`
  );
}

export function activate(context: vscode.ExtensionContext): void {
  const activeTheme = getActiveTheme();
  if (activeTheme) {
    applyCustomizations(activeTheme);
  }

  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration(
      (e: vscode.ConfigurationChangeEvent) => {
        if (
          e.affectsConfiguration("workbench.colorTheme") ||
          e.affectsConfiguration("vellumTheme")
        ) {
          const theme = getActiveTheme();
          if (theme) applyCustomizations(theme);
        }
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("vellumTheme.customize", async () => {
      const theme = getActiveTheme();

      if (!theme) {
        const themeNames = THEMES.map((t) => `"${t.label}"`).join(", ");
        vscode.window.showWarningMessage(
          `Please activate one of the Vellum themes first: ${themeNames}`
        );
        return;
      }

      const currentConfig = getConfig(theme);

      const picked = await vscode.window.showQuickPick(
        CUSTOMIZATION_OPTIONS.map((opt) => ({
          label: opt.label,
          description: opt.description,
          detail: `Current: ${currentConfig[opt.key] as string}`,
          key: opt.key,
        })),
        {
          placeHolder: `Customize ${theme.label} — pick a color to change`,
        }
      );

      if (!picked) return;

      const currentValue = currentConfig[picked.key];
      const newValue = await vscode.window.showInputBox({
        prompt: `Enter hex color for "${picked.label.replace(/\$\(.*?\)\s*/, "")}"`,
        value: currentValue,
        validateInput: (val: string) =>
          isValidHex(val) ? null : "Must be a valid hex color (e.g. #FF5370)",
        placeHolder: "#RRGGBB",
      });

      if (!newValue || !isValidHex(newValue)) return;

      const config = vscode.workspace.getConfiguration("vellumTheme");
      await config.update(
        `${theme.configKey}.${picked.key}`,
        newValue,
        vscode.ConfigurationTarget.Global
      );
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "vellumTheme.resetCustomizations",
      async () => {
        const theme = getActiveTheme();

        if (!theme) {
          vscode.window.showWarningMessage(
            "Please activate a Vellum theme first."
          );
          return;
        }

        const confirm = await vscode.window.showWarningMessage(
          `Reset all ${theme.label} customizations to defaults?`,
          { modal: true },
          "Reset"
        );

        if (confirm !== "Reset") return;

        const config = vscode.workspace.getConfiguration("vellumTheme");
        const keys: Array<keyof ThemeCustomization> = [
          "accentColor",
          "backgroundColor",
          "keywordColor",
          "stringColor",
          "functionColor",
        ];

        for (const key of keys) {
          await config.update(
            `${theme.configKey}.${key}`,
            undefined,
            vscode.ConfigurationTarget.Global
          );
        }

        const wbConfig = vscode.workspace.getConfiguration("workbench");
        const colorCust =
          wbConfig.get<Record<string, unknown>>("colorCustomizations") ?? {};
        delete colorCust[`[${theme.label}]`];
        await wbConfig.update(
          "colorCustomizations",
          colorCust,
          vscode.ConfigurationTarget.Global
        );

        vscode.window.showInformationMessage(
          `${theme.label} customizations reset to defaults.`
        );
      }
    )
  );
}

export function deactivate(): void {}
