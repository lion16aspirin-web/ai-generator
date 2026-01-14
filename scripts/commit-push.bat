@echo off
cd /d "%~dp0.."
echo ========================================
echo Git: Перевірка статусу
echo ========================================
git status

echo.
echo ========================================
echo Git: Додавання файлів
echo ========================================
git add .

echo.
echo ========================================
echo Git: Створення коміту
echo ========================================
git commit -m "feat: add chat memory and model switching

- Add Chat and Message models to Prisma schema
- Fix model switching in active chat (uses ref for sync)
- Add message persistence to database
- Add chat history loading on open
- Add API endpoints for chat history and model update
- Add ModelStatusDashboard to admin panel
- Update OpenRouter model mapping to actual model names
- Fix Buffer to Uint8Array conversion for Blob
- Fix duplicate exports (getAvailableImageModels, getAvailableVideoModels)
- Add 1536x1536 to ImageSize type
- Add estimateGenerationTime function export"

echo.
echo ========================================
echo Git: Push на GitHub
echo ========================================
git push origin main

echo.
echo ========================================
echo ✅ Готово! Vercel автоматично задеплоїть
echo ========================================
pause
