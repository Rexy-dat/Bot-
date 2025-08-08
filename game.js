import random
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import (
    ApplicationBuilder, CommandHandler, CallbackQueryHandler,
    ContextTypes
)

BOT_TOKEN = "8303257006:AAF4kip4AHtckV6yz5K4efkPz3SctNykpG0"

# Menyimpan data game per user
game_sessions = {}

def get_game_keyboard():
    keyboard = [
        [InlineKeyboardButton("🔫 TEMBAK!", callback_data='tembak')],
        [InlineKeyboardButton("❌ Menyerah", callback_data='menyerah')],
    ]
    return InlineKeyboardMarkup(keyboard)

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_id = update.effective_user.id

    # Buat sesi game
    game_sessions[user_id] = {
        "player_hp": 100,
        "bot_hp": 100
    }

    await update.message.reply_text(
        "🎮 Game dimulai!\nKamu VS Bot.\nHP: 100 vs 100\nKlik '🔫 TEMBAK!' untuk mulai.",
        reply_markup=get_game_keyboard()
    )

async def button_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    user_id = query.from_user.id
    await query.answer()

    if user_id not in game_sessions:
        await query.edit_message_text("⚠️ Kamu belum memulai game. Ketik /start.")
        return

    session = game_sessions[user_id]

    if query.data == 'tembak':
        # Pemain menembak
        player_damage = random.randint(10, 30)
        session['bot_hp'] -= player_damage

        # Cek apakah bot kalah
        if session['bot_hp'] <= 0:
            await query.edit_message_text(f"💥 Kamu menembak dan memberi {player_damage} damage!\n🤖 Bot KO!\n🏆 Kamu menang!")
            del game_sessions[user_id]
            return

        # Bot membalas
        bot_damage = random.randint(10, 25)
        session['player_hp'] -= bot_damage

        if session['player_hp'] <= 0:
            await query.edit_message_text(f"💥 Kamu menembak dan memberi {player_damage} damage!\n"
                                          f"🤖 Bot membalas dan memberi {bot_damage} damage!\n"
                                          f"💀 Kamu KO!\n🤖 Bot menang!")
            del game_sessions[user_id]
            return

        # Update status
        await query.edit_message_text(
            f"💥 Kamu memberi {player_damage} damage!\n"
            f"🤖 Bot memberi {bot_damage} damage!\n\n"
            f"❤️ HP Kamu: {session['player_hp']}\n"
            f"🤖 HP Bot: {session['bot_hp']}",
            reply_markup=get_game_keyboard()
        )

    elif query.data == 'menyerah':
        await query.edit_message_text("🏳️ Kamu menyerah. Game berakhir.")
        del game_sessions[user_id]

async def main():
    app = ApplicationBuilder().token(BOT_TOKEN).build()

    app.add_handler(CommandHandler("start", start))
    app.add_handler(CallbackQueryHandler(button_handler))

    print("🤖 Bot game tembak-tembakan aktif...")
    await app.run_polling()

if __name__ == "__main__":
    import asyncio
    asyncio.run(main())
    