import { Box, Text, useApp, useInput, useStdout } from "ink";
import TextInput from "ink-text-input";
import { useCallback, useEffect, useState } from "react";
import { test } from "../commands/test.js";

const BUTTON_TEXT = "Click or press Enter to exit";
const BUTTON_WIDTH = BUTTON_TEXT.length + 6;
const BUTTON_HEIGHT = 3;
const CONTENT_HEIGHT = 1 + 1 + BUTTON_HEIGHT;
const PRESS_FEEDBACK_MS = 150;

// biome-ignore lint/suspicious/noControlCharactersInRegex: SGR mouse sequences begin with ESC.
const MOUSE_PRESS_RE = /\x1b\[<(\d+);(\d+);(\d+)M/;

type Phase = "input" | "greeting";

function isInButton(x: number, y: number, cols: number, rows: number): boolean {
  const contentTop = Math.floor((rows - CONTENT_HEIGHT) / 2) + 1;
  const buttonTop = contentTop + 2;
  const buttonBottom = buttonTop + BUTTON_HEIGHT - 1;
  const buttonLeft = Math.floor((cols - BUTTON_WIDTH) / 2) + 1;
  const buttonRight = buttonLeft + BUTTON_WIDTH - 1;
  return y >= buttonTop && y <= buttonBottom && x >= buttonLeft && x <= buttonRight;
}
export function Test() {
  const { exit } = useApp();
  const { stdout } = useStdout();
  const [phase, setPhase] = useState<Phase>("input");
  const [name, setName] = useState("");
  const [pressed, setPressed] = useState(false);
  const activate = useCallback(() => {
    setPressed(true);
    setTimeout(exit, PRESS_FEEDBACK_MS);
  }, [exit]);
  const handleSubmit = useCallback(() => {
    setPhase("greeting");
  }, []);
  useInput((_input, key) => {
    if (key.escape) {
      exit();
      return;
    }
    if (phase === "greeting" && key.return) {
      activate();
    }
  });
  useEffect(() => {
    if (phase !== "greeting") return;
    const handler = (data: Buffer) => {
      const match = data.toString().match(MOUSE_PRESS_RE);
      if (!match) return;
      const button = Number(match[1]);
      const x = Number(match[2]);
      const y = Number(match[3]);
      if (button === 0 && isInButton(x, y, stdout.columns, stdout.rows)) {
        activate();
      }
    };
    process.stdin.on("data", handler);
    return () => {
      process.stdin.off("data", handler);
    };
  }, [phase, activate, stdout]);
  const buttonColor = pressed ? "magenta" : "cyan";
  return (
    <Box
      width={stdout.columns}
      height={stdout.rows}
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
    >
      {phase === "input" ? (
        <>
          <Text>What is your name?</Text>
          <Box marginTop={1} borderStyle="round" borderColor="cyan" paddingX={1} minWidth={24}>
            <TextInput value={name} onChange={setName} onSubmit={handleSubmit} placeholder="…" />
          </Box>
        </>
      ) : (
        <>
          <Text>{test(name)}</Text>
          <Box marginTop={1} borderStyle="round" borderColor={buttonColor} paddingX={2}>
            <Text color={buttonColor} bold>
              {BUTTON_TEXT}
            </Text>
          </Box>
        </>
      )}
    </Box>
  );
}
