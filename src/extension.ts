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

function getActiveThemeKey(): "ivory" | "materialHC" | null {
  const activeThemeId = vscode.workspace
    .getConfiguration("workbench")
    .get<string>("colorTheme");
  if (activeThemeId === "Ivory Light") return "ivory";
  if (activeThemeId === "Material HC Dark") return "materialHC";
  return null;
}

function getConfig(themeKey: "ivory" | "materialHC"): ThemeCustomization {
  const config = vscode.workspace.getConfiguration("vellumTheme");
  return {
    accentColor: config.get(`${themeKey}.accentColor`) as string,
    backgroundColor: config.get(`${themeKey}.backgroundColor`) as string,
    keywordColor: config.get(`${themeKey}.keywordColor`) as string,
    stringColor: config.get(`${themeKey}.stringColor`) as string,
    functionColor: config.get(`${themeKey}.functionColor`) as string,
  };
}

function buildColorCustomizations(
  themeKey: "ivory" | "materialHC",
  customization: ThemeCustomization
): Record<string, Record<string, string>> {
  const themeLabel =
    themeKey === "ivory" ? "Ivory Light" : "Material HC Dark";
  const bg = customization.backgroundColor;

  const colorCustomizations: Record<string, string> = {
    "statusBar.background": customization.accentColor,
    "statusBar.foreground": themeKey === "ivory" ? "#FFFFFF" : "#000000",
    "activityBarBadge.background": customization.accentColor,
    "editorLink.activeForeground": customization.accentColor,
    "button.background": customization.accentColor,
    "progressBar.background": customization.accentColor,
    "editor.background": bg,
    "editor.foreground":
      themeKey === "ivory" ? "#3C3C3C" : "#EEFFFF",
    "sideBar.background":
      themeKey === "ivory"
        ? adjustBrightness(bg, -10)
        : adjustBrightness(bg, 5),
    "editorGroupHeader.tabsBackground":
      themeKey === "ivory"
        ? adjustBrightness(bg, -5)
        : adjustBrightness(bg, 3),
    "tab.activeBackground": bg,
  };

  return { [`[${themeLabel}]`]: colorCustomizations };
}

function buildTokenColorCustomizations(
  themeKey: "ivory" | "materialHC",
  customization: ThemeCustomization
): Record<string, unknown> {
  const themeLabel =
    themeKey === "ivory" ? "Ivory Light" : "Material HC Dark";

  return {
    [`[${themeLabel}]`]: {
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

async function applyCustomizations(
  themeKey: "ivory" | "materialHC"
): Promise<void> {
  const customization = getConfig(themeKey);
  const colorCustomizations = buildColorCustomizations(
    themeKey,
    customization
  );
  const tokenColorCustomizations = buildTokenColorCustomizations(
    themeKey,
    customization
  );

  const config = vscode.workspace.getConfiguration("workbench");
  const existing =
    config.get<Record<string, unknown>>("colorCustomizations") ?? {};
  const themeLabel =
    themeKey === "ivory" ? "[Ivory Light]" : "[Material HC Dark]";

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
    `Theme customizations applied for ${themeLabel.replace(/\[|\]/g, "")}`
  );
}

export function activate(context: vscode.ExtensionContext): void {
  // Auto-apply on activation if theme is active
  const themeKey = getActiveThemeKey();
  if (themeKey) {
    applyCustomizations(themeKey);
  }

  // Re-apply when theme changes
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((e: vscode.ConfigurationChangeEvent) => {
      if (e.affectsConfiguration("workbench.colorTheme")) {
        const key = getActiveThemeKey();
        if (key) applyCustomizations(key);
      }
    })
  );

  // Re-apply when config changes
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((e: vscode.ConfigurationChangeEvent) => {
      if (
        e.affectsConfiguration("workbench.colorTheme") ||
        e.affectsConfiguration("vellumTheme")
      ) {
        const key = getActiveThemeKey();
        if (key) applyCustomizations(key);
      }
    })
  );

  // Customize command
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "vellumTheme.customize",
      async () => {
        const themeKey = getActiveThemeKey();

        if (!themeKey) {
          vscode.window.showWarningMessage(
            'Please activate "Ivory Light" or "Material HC Dark" theme first.'
          );
          return;
        }

        const themeLabel = themeKey === "ivory" ? "Ivory Light" : "Material HC Dark";
        const currentConfig = getConfig(themeKey);

        const picked = await vscode.window.showQuickPick(
          CUSTOMIZATION_OPTIONS.map((opt) => ({
            label: opt.label,
            description: opt.description,
            detail: `Current: ${currentConfig[opt.key] as string}`,
            key: opt.key,
          })),
          {
            placeHolder: `Customize ${themeLabel} — pick a color to change`,
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
          `${themeKey}.${picked.key}`,
          newValue,
          vscode.ConfigurationTarget.Global
        );
      }
    )
  );

  // Reset command
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "vellumTheme.resetCustomizations",
      async () => {
        const themeKey = getActiveThemeKey();
        const themeLabel = themeKey === "ivory" ? "Ivory Light" : "Material HC Dark";

        const confirm = await vscode.window.showWarningMessage(
          `Reset all ${themeLabel} customizations to defaults?`,
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
            `${themeKey ?? "ivory"}.${key}`,
            undefined,
            vscode.ConfigurationTarget.Global
          );
        }

        // Clear workbench/editor overrides for this theme
        const wbConfig = vscode.workspace.getConfiguration("workbench");
        const colorCust =
          wbConfig.get<Record<string, unknown>>("colorCustomizations") ?? {};
        const label =
          themeKey === "ivory" ? "[Ivory Light]" : "[Material HC Dark]";
        delete colorCust[label];
        await wbConfig.update(
          "colorCustomizations",
          colorCust,
          vscode.ConfigurationTarget.Global
        );

        vscode.window.showInformationMessage(
          `${themeLabel} customizations reset to defaults.`
        );
      }
    )
  );
}

export function deactivate(): void {}
