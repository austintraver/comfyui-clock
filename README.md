# comfyui-clock

A live elapsed timer in the ComfyUI menu bar. Shows you how long your workflow has been running without needing to check the console or guess.

<!-- If you have a screenshot or GIF, drop it here: -->
<!-- ![comfyui-clock screenshot](screenshot.png) -->



https://github.com/user-attachments/assets/c79711b1-c77a-4206-8d5c-f9a39542199b



## Features

- Displays a `⏱ 0:00` timer in the top menu bar as soon as a workflow starts executing
- Updates every second so you can watch it tick
- Turns **green** with a checkmark on success, **red** with an X on error
- Resets automatically after a job ends, so it's ready for the next run
- Pure frontend -- no Python dependencies, no extra nodes, no server-side changes

## Installation

### ComfyUI Manager (recommended)

Search for `comfyui-clock` in the Custom Nodes section and install it from there.

### Manual

```bash
cd ComfyUI/custom_nodes
git clone https://github.com/austintraver/comfyui-clock.git
```

Restart ComfyUI and refresh your browser. That's it.

## How it works

The extension registers a single frontend script that hooks into ComfyUI's built-in API events (`execution_start`, `execution_success`, `execution_error`, `execution_interrupted`). It creates a small timer element and injects it into the top menu bar next to the existing queue buttons, matching their border and font styles so it blends in with whatever theme you're using.

There are no custom nodes added to the node graph. The `__init__.py` just points ComfyUI at the `js/` directory.

## Compatibility

Requires the new ComfyUI menu UI (2024+). The timer targets the top menu bar layout and copies its styles from the adjacent `.queue-button-group`, so it should work with custom themes out of the box.

If the menu bar hasn't mounted when the extension loads, a `MutationObserver` waits for it and injects the timer as soon as it appears.

## License

MIT
