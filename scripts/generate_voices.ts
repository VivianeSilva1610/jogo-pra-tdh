/**
 * Script para gerar áudios pré-gravados usando a API do ElevenLabs.
 * Gera 36 arquivos MP3 (9 frases × 4 idiomas) em assets/audio/voices/
 */

const fs = require('fs');
const path = require('path');

const API_KEY = process.env.ELEVENLABS_API_KEY;
if (!API_KEY) {
  console.error('❌ Defina a variável ELEVENLABS_API_KEY');
  process.exit(1);
}

// Voice ID (Bella - Soft American female, mas o modelo multilingual fala todos os idiomas perfeitamente)
const VOICE_ID = 'EXAVITQu4vr4xnSDxMaL'; 

// Frases a serem geradas para cada idioma
const PHRASES: Record<string, Record<string, string>> = {
  pt: {
    tryAgain: 'Vamos tentar novamente?',
    wellDone: 'Muito bem!',
    fantastic: 'Fantástico!',
    amazing: 'Incrível!',
    youCanDoIt: 'Você consegue!',
    castleOpened: 'O portão do castelo se abriu!',
    perfect_1: 'Perfeito!!!',
    perfect_2: 'Incrível! Você mandou bem!',
    perfect_3: 'Arrasou! 3 de 3!',
  },
  en: {
    tryAgain: "Let's try again?",
    wellDone: 'Well done!',
    fantastic: 'Fantastic!',
    amazing: 'Amazing!',
    youCanDoIt: 'You can do it!',
    castleOpened: 'The castle gate has opened!',
    perfect_1: 'Perfect!!!',
    perfect_2: 'Amazing! You nailed it!',
    perfect_3: 'Flawless! 3 for 3!',
  },
  it: {
    tryAgain: 'Riproviamo?',
    wellDone: 'Ben fatto!',
    fantastic: 'Fantastico!',
    amazing: 'Incredibile!',
    youCanDoIt: 'Ce la puoi fare!',
    castleOpened: "Il portone del castelo si è aperto!",
    perfect_1: 'Perfetto!!!',
    perfect_2: "Incredibile! Ce l'hai fatta!",
    perfect_3: 'Perfetto! 3 su 3!',
  },
  es: {
    tryAgain: '¿Intentamos de nuevo?',
    wellDone: '¡Muy bien!',
    fantastic: '¡Fantástico!',
    amazing: '¡Increíble!',
    youCanDoIt: '¡Tú puedes!',
    castleOpened: '¡El portón del castillo se ha abierto!',
    perfect_1: '¡Perfecto!!!',
    perfect_2: '¡Increíble! ¡Lo lograste!',
    perfect_3: '¡Sin errores! 3 de 3!',
  },
};

async function synthesize(text: string): Promise<Buffer> {
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Accept': 'audio/mpeg',
      'Content-Type': 'application/json',
      'xi-api-key': API_KEY as string,
    },
    body: JSON.stringify({
      text: text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
      }
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`ElevenLabs API error ${response.status}: ${errorText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

async function main() {
  const outputDir = path.resolve(__dirname, '..', 'assets', 'audio', 'voices');
  
  let totalGenerated = 0;
  let totalErrors = 0;

  for (const [lang, phrases] of Object.entries(PHRASES)) {
    const langDir = path.join(outputDir, lang);
    fs.mkdirSync(langDir, { recursive: true });

    console.log(`\n🌍 Gerando áudios em ${lang.toUpperCase()}...`);

    for (const [key, text] of Object.entries(phrases)) {
      const filePath = path.join(langDir, `${key}.mp3`);
      
      // Checa se já existe um arquivo VÁLIDO (não vazio)
      // Como geramos placeholders de 32 bytes antes, vamos considerar válidos só os maiores que 10KB
      const isPlaceholder = fs.existsSync(filePath) && fs.statSync(filePath).size < 10000;

      if (fs.existsSync(filePath) && !isPlaceholder) {
        console.log(`  ⏭️  ${key}: já existe arquivo válido, pulando.`);
        continue;
      }

      try {
        console.log(`  🔊 ${key}: "${text}"...`);
        const audioBuffer = await synthesize(text);
        fs.writeFileSync(filePath, audioBuffer);
        console.log(`  ✅ ${key}: salvo (${audioBuffer.length} bytes)`);
        totalGenerated++;

        // Pausa de 500ms para evitar Rate Limits (Too Many Requests) do ElevenLabs
        await new Promise(r => setTimeout(r, 500));
      } catch (error: any) {
        console.error(`  ❌ ${key}: ${error.message}`);
        totalErrors++;
      }
    }
  }

  console.log(`\n📊 Resumo:`);
  console.log(`   ✅ Gerados: ${totalGenerated}`);
  console.log(`   ❌ Erros: ${totalErrors}`);
  console.log(`   📁 Diretório: ${outputDir}`);
}

main().catch(console.error);
