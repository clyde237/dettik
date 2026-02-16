@echo off

mkdir components
mkdir components\debt
mkdir components\credit
mkdir components\payment
mkdir components\person
mkdir components\sync
mkdir components\layout
mkdir components\ui


type nul > components\layout\AppShell.svelte
type nul > components\layout\Sidebar.svelte
type nul > components\layout\BottomNav.svelte
type nul > components\layout\Header.svelte
type nul > components\layout\PageContainer.svelte

type nul > utils\currency.js
type nul > utils\date.js
type nul > utils\validators.js
type nul > utils\calculations.js
type nul > utils\file.js
type nul > utils\id.js
type nul > utils\constants.js

echo Structure creee avec succes !
pause
