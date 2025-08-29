# Gamepad Mapping

The client exposes basic support for the browser [Gamepad API](https://developer.mozilla.org/en-US/docs/Web/API/Gamepad_API). Buttons are translated into named events and a short rumble is triggered when a mapped button is pressed.

## Default Button Mapping

| Index | Button            | Event name     |
| ----- | ----------------- | -------------- |
| 0     | A / Cross         | `buttonA`      |
| 1     | B / Circle        | `buttonB`      |
| 2     | X / Square        | `buttonX`      |
| 3     | Y / Triangle      | `buttonY`      |
| 4     | Left bumper       | `bumperLeft`   |
| 5     | Right bumper      | `bumperRight`  |
| 6     | Left trigger      | `triggerLeft`  |
| 7     | Right trigger     | `triggerRight` |
| 8     | Select / Back     | `select`       |
| 9     | Start             | `start`        |
| 10    | Left stick press  | `stickLeft`    |
| 11    | Right stick press | `stickRight`   |
| 12    | D-pad up          | `dpadUp`       |
| 13    | D-pad down        | `dpadDown`     |
| 14    | D-pad left        | `dpadLeft`     |
| 15    | D-pad right       | `dpadRight`    |
| 16    | Home / Guide      | `home`         |

## Remapping

Use the `useGamepad(gameId)` hook to listen for actions and remap button indices per game. Profiles are stored in `localStorage` under `gamepad.profile.<gameId>`.
