#!/bin/bash
# Frase a Frase: record every sentence with the built-in macOS voices.
# Run in Terminal:  bash ~/Downloads/make-frase-audio.sh
# Result: ~/Desktop/frase-audio.zip  (attach it in the Claude chat)
# Better quality: System Settings > Accessibility > Spoken Content > System voice > Manage Voices,
# download "Mónica (Premium/Enhanced)" (Spanish, Spain) and "Joana (Premium/Enhanced)" (Portuguese, Portugal).
set -euo pipefail

best_voice() { # $1 = base name, $2 = locale
  local list; list=$(say -v '?')
  for q in "Premium" "Enhanced"; do
    local v; v=$(printf '%s\n' "$list" | grep -E "^$1 \($q\)" | head -1 | sed -E 's/ +[a-z]{2}_[A-Z]{2}.*//' || true)
    [ -n "$v" ] && { echo "$v"; return; }
  done
  local v; v=$(printf '%s\n' "$list" | grep -E "^$1 " | head -1 | sed -E 's/ +[a-z]{2}_[A-Z]{2}.*//' || true)
  [ -n "$v" ] && { echo "$v"; return; }
  printf '%s\n' "$list" | grep " $2 " | head -1 | sed -E 's/ +[a-z]{2}_[A-Z]{2}.*//' || true
}
ES_VOICE="${ES_VOICE:-$(best_voice "Mónica" "es_ES")}"
[ -z "$ES_VOICE" ] && ES_VOICE="$(best_voice "Monica" "es_ES")"
PT_VOICE="${PT_VOICE:-$(best_voice "Joana" "pt_PT")}"
echo "Spanish voice:    ${ES_VOICE:-NOT FOUND}"
echo "Portuguese voice: ${PT_VOICE:-NOT FOUND}"
[ -z "$ES_VOICE" ] || [ -z "$PT_VOICE" ] && { echo "Install the missing voice (see top of script) and run again."; exit 1; }

VOICE_DIR="${VOICE_DIR:-female}"   # folder name = voice label shown in the app (e.g. female, male)
OUT="$(mktemp -d)/frase-audio"; mkdir -p "$OUT/audio/es/$VOICE_DIR" "$OUT/audio/pt/$VOICE_DIR"
es_ids=(); pt_ids=(); n=0
while IFS=$'\t' read -r lang id text; do
  [ -z "$lang" ] && continue
  v="$ES_VOICE"; [ "$lang" = "pt" ] && v="$PT_VOICE"
  f="$OUT/audio/$lang/$VOICE_DIR/$id"
  rate=165; [[ "$id" == g* ]] && rate=182   # cold-water passages at natural speed
  say -v "$v" -r "$rate" -o "$f.aiff" -- "$text"
  afconvert -f m4af -d aac -b 64000 "$f.aiff" "$f.m4a" && rm "$f.aiff"
  if [ "$lang" = "es" ]; then es_ids+=("$id"); else pt_ids+=("$id"); fi
  n=$((n+1)); printf '\r%d clips' "$n"
done <<'SENTENCES'
es	0	¡Hola, buenos días!
es	1	¿Cómo estás?
es	2	Estoy bien, gracias. ¿Y tú?
es	3	Me llamo Ana. ¿Cómo te llamas?
es	4	Mucho gusto.
es	5	No entiendo. ¿Puede hablar más despacio?
es	6	Un café con leche, por favor.
es	7	Quisiera una botella de agua.
es	8	¿Cuánto es?
es	9	¿Puedo pagar con tarjeta?
es	10	¿Tienen wifi?
es	11	La cuenta, por favor.
es	12	Perdone, ¿dónde está la estación de tren?
es	13	¿Está lejos de aquí?
es	14	Gire a la izquierda en la próxima calle.
es	15	Siga todo recto.
es	16	Un billete al centro, por favor.
es	17	¿A qué hora sale el autobús?
es	18	Tengo una reserva a nombre de Weber.
es	19	¿El desayuno está incluido?
es	20	¿A qué hora tenemos que dejar la habitación?
es	21	El aire acondicionado no funciona.
es	22	¿Me puede llamar un taxi?
es	23	¿Puedo dejar mi equipaje aquí?
es	24	Solo estoy mirando, gracias.
es	25	¿Tiene esto en una talla más grande?
es	26	Cuesta veinte euros.
es	27	Es demasiado caro.
es	28	¿Dónde me lo puedo probar?
es	29	Me lo llevo.
es	30	Una mesa para dos, por favor.
es	31	¿Qué me recomienda?
es	32	Soy vegetariano.
es	33	Soy alérgico a los frutos secos.
es	34	¡Estaba delicioso!
es	35	¿Nos trae un poco más de pan?
es	36	¿De dónde eres?
es	37	Soy de Alemania.
es	38	Trabajo como ingeniero de software.
es	39	¿Qué haces en tu tiempo libre?
es	40	Llevo dos meses aprendiendo tu idioma.
es	41	Hoy hace muy buen tiempo.
es	42	Necesito un médico.
es	43	Me duele la cabeza.
es	44	¿Dónde está la farmacia más cercana?
es	45	¿Tiene algo para el resfriado?
es	46	Tengo fiebre desde ayer.
es	47	¡Llame a una ambulancia!
es	48	¿Qué hora es?
es	49	¿Quedamos mañana a las ocho?
es	50	Llego diez minutos tarde.
es	51	¿Estás libre el sábado?
es	52	Lo siento, hoy no puedo.
es	53	¡Hasta luego!
es	54	He perdido mi móvil.
es	55	¿Me puede ayudar, por favor?
es	56	Mi tarjeta no funciona.
es	57	He perdido mi vuelo.
es	58	¿Cómo se dice eso?
es	59	¿Qué significa esta palabra?
es	60	Dos cafés y una ración de churros, por favor.
es	61	¿Para tomar aquí o para llevar?
es	62	Para tomar aquí, por favor.
es	63	¿Tiene chocolate caliente?
es	64	¡Todavía están calentitos!
es	65	¿Me pone también un vaso de agua?
es	66	¿Qué tren va a Toledo?
es	67	Dos billetes de ida y vuelta, por favor.
es	68	¿Cuánto cuesta la entrada al museo?
es	69	¿Hay descuento para estudiantes?
es	70	¿Dónde se coge el autobús al casco antiguo?
es	71	¿Se pueden hacer fotos dentro del museo?
es	84	Un café con leche grande para llevar, por favor.
es	85	Con leche de avena, por favor.
es	86	Sin azúcar.
es	87	¿Me da una tapa, por favor?
es	88	¿A nombre de quién?
es	89	Tengo un poco de prisa.
es	90	¿Tienen mesa para seis?
es	91	¿Cuánto hay que esperar?
es	92	Podemos esperar en la barra.
es	93	¿Podemos sentarnos fuera?
es	94	Vienen dos amigos más.
es	95	¿Podemos pagar por separado?
es	96	¿Necesita bolsa?
es	97	No, gracias, tengo mi bolsa.
es	98	¿Tiene tarjeta de cliente?
es	99	¿Con tarjeta o en efectivo?
es	100	Introduzca la tarjeta, por favor.
es	101	¿Quiere el tique?
es	102	¿Qué es esto?
es	103	¿Cómo funciona?
es	104	¿Está abierto los domingos?
es	105	¿Por qué está cerrado?
es	106	¿A quién puedo preguntar?
es	107	¿Cuál me recomienda?
es	108	La mesa está al lado de la ventana.
es	109	¿Está libre esta silla?
es	110	Mi portátil está en el escritorio.
es	111	Las llaves están en el cajón.
es	112	¿Dónde está el interruptor de la luz?
es	113	La cama es muy cómoda.
es	114	Quiero pan, queso y jamón.
es	115	¿Tiene pescado fresco hoy?
es	116	Un kilo de tomates, por favor.
es	117	No como carne.
es	118	Arroz con pollo y verduras.
es	119	Los huevos y la leche están allí.
es	120	Los lunes trabajo desde casa.
es	121	Normalmente me levanto a las siete.
es	122	Anoche dormí fatal.
es	123	Ahora mismo estoy trabajando.
es	124	Me voy a la cama, estoy muy cansado.
es	125	Después del trabajo salgo a correr.
es	126	Se tarda unos veinte minutos.
es	127	La tienda abre a las nueve y cierra a las ocho.
es	128	Voy a estar aquí una semana.
es	129	Son las tres y media.
es	130	Llevo una hora esperando.
es	131	Nos vemos dentro de dos días.
es	132	Quisiera alquilar un coche para tres días.
es	133	¿El seguro está incluido?
es	134	Aquí tiene mi carné de conducir.
es	135	¿Tengo que devolverlo con el depósito lleno?
es	136	¿Es manual o automático?
es	137	¿Dónde puedo aparcar?
pt	0	Olá, bom dia!
pt	1	Como estás?
pt	2	Estou bem, obrigado. E tu?
pt	3	Chamo-me Ana. Como te chamas?
pt	4	Muito prazer.
pt	5	Não percebo. Pode falar mais devagar?
pt	6	Um café com leite, por favor.
pt	7	Queria uma garrafa de água.
pt	8	Quanto é?
pt	9	Posso pagar com cartão?
pt	10	Têm Wi-Fi?
pt	11	A conta, por favor.
pt	12	Desculpe, onde fica a estação de comboios?
pt	13	Fica longe daqui?
pt	14	Vire à esquerda na próxima rua.
pt	15	Siga em frente.
pt	16	Um bilhete para o centro, por favor.
pt	17	A que horas parte o autocarro?
pt	18	Tenho uma reserva em nome de Weber.
pt	19	O pequeno-almoço está incluído?
pt	20	A que horas temos de deixar o quarto?
pt	21	O ar condicionado não funciona.
pt	22	Pode chamar-me um táxi?
pt	23	Posso deixar a bagagem aqui?
pt	24	Estou só a ver, obrigado.
pt	25	Tem isto num tamanho maior?
pt	26	Custa vinte euros.
pt	27	É demasiado caro.
pt	28	Onde posso experimentar?
pt	29	Vou levar.
pt	30	Uma mesa para dois, por favor.
pt	31	O que me recomenda?
pt	32	Sou vegetariano.
pt	33	Sou alérgico a frutos secos.
pt	34	Estava delicioso!
pt	35	Pode trazer-nos mais pão?
pt	36	De onde és?
pt	37	Sou da Alemanha.
pt	38	Trabalho como engenheiro de software.
pt	39	O que fazes nos tempos livres?
pt	40	Estou a aprender a tua língua há dois meses.
pt	41	Hoje está um tempo ótimo.
pt	42	Preciso de um médico.
pt	43	Dói-me a cabeça.
pt	44	Onde fica a farmácia mais próxima?
pt	45	Tem alguma coisa para a constipação?
pt	46	Tenho febre desde ontem.
pt	47	Chame uma ambulância!
pt	48	Que horas são?
pt	49	Encontramo-nos amanhã às oito?
pt	50	Vou chegar dez minutos atrasado.
pt	51	Estás livre no sábado?
pt	52	Desculpa, hoje não posso.
pt	53	Até logo!
pt	54	Perdi o meu telemóvel.
pt	55	Pode ajudar-me, por favor?
pt	56	O meu cartão não está a funcionar.
pt	57	Perdi o meu voo.
pt	58	Como se diz isso?
pt	59	O que significa esta palavra?
pt	72	Duas bicas e dois pastéis de nata, por favor.
pt	73	É para comer aqui ou para levar?
pt	74	Para comer aqui, se faz favor.
pt	75	Tem canela?
pt	76	Ainda estão quentinhos!
pt	77	Pode dar-me também um copo de água?
pt	78	Qual é o comboio que vai para Sintra?
pt	79	Dois bilhetes de ida e volta, por favor.
pt	80	Quanto custa a entrada no palácio?
pt	81	Há desconto para estudantes?
pt	82	Onde apanho o autocarro para o Palácio da Pena?
pt	83	Posso tirar fotografias dentro do museu?
pt	84	Um galão grande para levar, por favor.
pt	85	Com leite de aveia, por favor.
pt	86	Sem açúcar.
pt	87	Pode dar-me uma tampa, por favor?
pt	88	Em nome de quem?
pt	89	Estou com um bocado de pressa.
pt	90	Têm mesa para seis?
pt	91	Quanto tempo é preciso esperar?
pt	92	Podemos esperar ao balcão.
pt	93	Podemos sentar-nos lá fora?
pt	94	Vêm mais dois amigos.
pt	95	Podemos pagar em separado?
pt	96	Precisa de saco?
pt	97	Não, obrigado, tenho o meu saco.
pt	98	Tem cartão de cliente?
pt	99	Cartão ou dinheiro?
pt	100	Introduza o cartão, por favor.
pt	101	Quer o talão?
pt	102	O que é isto?
pt	103	Como é que funciona?
pt	104	Está aberto ao domingo?
pt	105	Porque é que está fechado?
pt	106	A quem posso perguntar?
pt	107	Qual me recomenda?
pt	108	A mesa está ao lado da janela.
pt	109	Esta cadeira está livre?
pt	110	O meu portátil está na secretária.
pt	111	As chaves estão na gaveta.
pt	112	Onde está o interruptor da luz?
pt	113	A cama é muito confortável.
pt	114	Queria pão, queijo e fiambre.
pt	115	Tem peixe fresco hoje?
pt	116	Um quilo de tomates, por favor.
pt	117	Não como carne.
pt	118	Arroz com frango e legumes.
pt	119	Os ovos e o leite estão ali.
pt	120	Às segundas trabalho a partir de casa.
pt	121	Normalmente levanto-me às sete.
pt	122	Dormi muito mal esta noite.
pt	123	Neste momento estou a trabalhar.
pt	124	Vou para a cama, estou muito cansado.
pt	125	Depois do trabalho vou correr.
pt	126	Demora uns vinte minutos.
pt	127	A loja abre às nove e fecha às oito.
pt	128	Vou ficar cá uma semana.
pt	129	São três e meia.
pt	130	Estou à espera há uma hora.
pt	131	Vemo-nos daqui a dois dias.
pt	132	Queria alugar um carro por três dias.
pt	133	O seguro está incluído?
pt	134	Aqui está a minha carta de condução.
pt	135	Tenho de o devolver com o depósito cheio?
pt	136	É manual ou automático?
pt	137	Onde posso estacionar?
es	g0	¡Hola! Perdona, ¿eres el amigo de Lucía? Ella me ha dicho que llegabas hoy. Yo soy Marta, su compañera de piso. Lucía todavía está en el trabajo, pero vuelve sobre las siete.
pt	g1	Olá! Desculpa, és o amigo da Inês? Ela disse-me que chegavas hoje. Eu sou a Rita, vivo com ela. A Inês ainda está no trabalho, mas volta por volta das sete.
es	g2	Lo siento, la máquina de tarjetas no funciona ahora mismo. Si quiere, puede pagar en efectivo, o hay un cajero justo al lado de la farmacia, a dos minutos.
pt	g3	Peço desculpa, a máquina do multibanco não está a funcionar neste momento. Se quiser, pode pagar em dinheiro, ou há uma caixa multibanco mesmo ao lado da farmácia, a dois minutos.
es	g4	Atención, por favor. El tren con destino a Valencia, que tenía prevista su salida a las diez y cuarto, saldrá con veinte minutos de retraso por la vía cuatro. Disculpen las molestias.
pt	g5	Atenção, por favor. O comboio com destino ao Porto, com partida prevista para as dez e um quarto, vai sair com vinte minutos de atraso da linha quatro. Pedimos desculpa pelo incómodo.
es	g6	Su habitación todavía no está lista, porque la limpieza termina a las dos. Mientras tanto, puede dejar las maletas aquí en recepción y, por la espera, el desayuno de hoy corre de nuestra cuenta.
pt	g7	O seu quarto ainda não está pronto, porque a limpeza só termina às duas. Entretanto, pode deixar as malas aqui na receção e, pela espera, o pequeno-almoço de hoje fica por nossa conta.
es	g8	Esta talla ya no la tenemos en tienda, pero se la podemos pedir y llega en tres o cuatro días. Si no, creo que en la tienda del centro comercial todavía les quedan.
pt	g9	Este tamanho já não temos em loja, mas podemos encomendar e chega daqui a três ou quatro dias. Senão, acho que a loja do centro comercial ainda tem.
es	g10	Hoy el pescado del día es dorada a la plancha, viene con patatas y ensalada. El cordero se nos ha acabado, lo siento. Y de postre, la tarta de queso es casera, la recomiendo mucho.
pt	g11	Hoje o peixe do dia é dourada grelhada, vem com batatas e salada. O borrego já acabou, peço desculpa. E de sobremesa, o bolo de bolacha é feito cá em casa, recomendo muito.
es	g12	Pues yo nací en Sevilla, pero llevo casi diez años viviendo en Madrid por el trabajo. Me gusta la ciudad, aunque echo de menos el sol y, sobre todo, la comida de mi madre.
pt	g13	Olha, eu nasci no Porto, mas já vivo em Lisboa há quase dez anos por causa do trabalho. Gosto da cidade, mas tenho saudades da família e, sobretudo, da comida da minha mãe.
es	g14	Tómese una pastilla cada ocho horas, siempre después de comer, durante cinco días. Si mañana todavía tiene fiebre o le duele más la garganta, vuelva o vaya directamente al centro de salud.
pt	g15	Tome um comprimido de oito em oito horas, sempre depois das refeições, durante cinco dias. Se amanhã ainda tiver febre ou se a garganta piorar, volte cá ou vá diretamente ao centro de saúde.
es	g16	Oye, al final no puedo el sábado por la tarde, tengo que ayudar a mi hermano con la mudanza. ¿Te viene bien el domingo por la mañana? Podríamos ir al Rastro y luego tomar algo.
pt	g17	Olha, afinal não posso no sábado à tarde, tenho de ajudar o meu irmão com a mudança. Dá-te jeito domingo de manhã? Podíamos ir à Feira da Ladra e depois beber qualquer coisa.
es	g18	Para bloquear la tarjeta tiene que llamar a su banco, el número está en la aplicación. Y para el móvil, lo mejor es poner una denuncia en la comisaría; la más cercana está en esta misma calle, al fondo.
pt	g19	Para cancelar o cartão tem de ligar para o seu banco, o número está na aplicação. Quanto ao telemóvel, o melhor é fazer queixa na esquadra; a mais próxima fica nesta mesma rua, lá ao fundo.
es	g20	Los churros salen ahora mismo, en cinco minutillos los tienen. El chocolate es bastante espeso, si lo prefiere más ligero le pongo un café con leche. Siéntense donde quieran, que se lo llevo a la mesa.
pt	g21	Os pastéis acabaram de sair do forno, estão a escaldar, cuidado! A canela e o açúcar estão ali no balcão. Se quiserem sentar-se lá fora, há uma mesa livre, e eu levo-lhes as bicas.
es	g22	Las entradas para la catedral se compran en la taquilla de enfrente, no aquí. Los miércoles por la tarde es gratis para los residentes, pero para los turistas cuesta doce euros, con la audioguía incluida.
pt	g23	Para o Palácio da Pena, o melhor é apanhar o autocarro 434 aqui à frente da estação. Os bilhetes compram-se online ou na entrada, mas ao fim de semana há muita fila, por isso convém ir cedo.
es	g24	¿El café con leche lo quiere grande o normal? La leche de avena cuesta cincuenta céntimos más. Ahora mismo hay un poco de cola, así que serán unos cinco minutos. ¿A nombre de quién lo pongo?
pt	g25	Quer o galão grande ou normal? O leite de aveia custa mais cinquenta cêntimos. Agora há um bocadinho de fila, por isso são uns cinco minutos. Em nome de quem é?
es	g26	Para seis personas ahora mismo no tenemos nada dentro, pero en la terraza se queda libre una mesa en unos quince minutos. Si quieren, pueden esperar en la barra y les aviso.
pt	g27	Para seis pessoas agora não temos nada lá dentro, mas na esplanada vai ficar uma mesa livre daqui a uns quinze minutos. Se quiserem, podem esperar ao balcão e eu aviso.
es	g28	Son veintitrés con cuarenta. ¿Tiene tarjeta de cliente? Con ella hoy tiene un diez por ciento de descuento en la fruta. Las bolsas cuestan diez céntimos cada una.
pt	g29	São vinte e três e quarenta. Tem cartão de cliente? Com o cartão hoje tem dez por cento de desconto na fruta. Os sacos custam dez cêntimos cada.
es	g30	Esta máquina es para recargar la tarjeta de transporte. Primero eliges el idioma, luego pones la tarjeta aquí encima y pagas. Si te da error, pregunta en la ventanilla, que está abierta hasta las diez.
pt	g31	Esta máquina é para carregar o cartão de transportes. Primeiro escolhe a língua, depois põe o cartão aqui em cima e paga. Se der erro, pergunte na bilheteira, que está aberta até às dez.
es	g32	El piso es pequeño pero muy práctico. En el salón tienes un sofá cama y un escritorio junto a la ventana para trabajar. Las toallas están en el armario del pasillo y la llave del buzón, en el cajón de la cocina.
pt	g33	O apartamento é pequeno mas muito prático. Na sala tem um sofá-cama e uma secretária ao pé da janela para trabalhar. As toalhas estão no armário do corredor e a chave da caixa do correio está na gaveta da cozinha.
es	g34	Hoy el pescado está muy bien, la merluza ha llegado esta mañana. Las fresas también están de oferta, a dos euros la caja. Lo que no me queda es pan integral, solo el blanco.
pt	g35	Hoje o peixe está muito bom, a pescada chegou esta manhã. Os morangos também estão em promoção, a dois euros a caixa. O que já não tenho é pão integral, só o branco.
es	g36	Esta semana estoy fatal. Trabajo de nueve a siete, luego voy al gimnasio y llego a casa tardísimo. Ayer me acosté a la una y hoy me he levantado a las seis. Necesito dormir un fin de semana entero.
pt	g37	Esta semana está a ser terrível. Trabalho das nove às sete, depois vou ao ginásio e chego a casa tardíssimo. Ontem deitei-me à uma e hoje levantei-me às seis. Preciso de dormir um fim de semana inteiro.
es	g38	El museo abre de martes a domingo, de diez a seis, pero la última entrada es a las cinco. La visita completa dura más o menos hora y media, así que yo vendría como muy tarde a las cuatro.
pt	g39	O museu abre de terça a domingo, das dez às seis, mas a última entrada é às cinco. A visita completa demora mais ou menos hora e meia, por isso eu vinha o mais tardar às quatro.
es	g40	El coche tiene el depósito lleno y hay que devolverlo igual. El seguro básico está incluido, pero si quiere el seguro a todo riesgo son quince euros más al día. Lo puede dejar en el aeropuerto sin coste adicional.
pt	g41	O carro tem o depósito cheio e tem de o devolver da mesma forma. O seguro básico está incluído, mas se quiser o seguro contra todos os riscos são mais quinze euros por dia. Pode deixá-lo no aeroporto sem custo adicional.
SENTENCES
echo
join(){ local out="" x; for x in "$@"; do out+="${out:+,}\"$x\""; done; echo "$out"; }
printf '{"ext":"m4a","voices":{"es":{"%s":[%s]},"pt":{"%s":[%s]}}}\n' "$VOICE_DIR" "$(join "${es_ids[@]}")" "$VOICE_DIR" "$(join "${pt_ids[@]}")" > "$OUT/audio/manifest.json"
(cd "$OUT" && zip -qr "$HOME/Desktop/frase-audio.zip" audio)
echo "Done: ~/Desktop/frase-audio.zip ($n clips). Attach it in the Claude chat."
