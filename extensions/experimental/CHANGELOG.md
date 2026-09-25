# Changelog

## Unreleased

- `wait` no longer holds an extension-server worker slot for the whole wait. It starts a timer, returns straight away, and completes the activity when the timer fires. A wait of 0 seconds or less completes immediately. Waits longer than one Node timer can hold (2^31 - 1 ms, about 24.8 days) are capped at that limit; before, Node fired them after 1 ms.
- `wait` is deprecated. Its title now reads `Wait (DEPRECATED)`.
