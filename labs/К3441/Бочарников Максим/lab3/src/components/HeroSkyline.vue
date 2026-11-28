<template>
<svg class="hero-skyline" viewBox="0 0 1440 320" preserveAspectRatio="xMidYMax meet" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id="haze" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#d89ad0" stop-opacity="0"/>
            <stop offset="100%" stop-color="#c478c0" stop-opacity="0.55"/>
          </linearGradient>
        </defs>
        <!-- дальний ряд — мягкий лавандовый силуэт -->
        <g fill="#b8b6e8" opacity="0.55">
          <rect x="20" y="210" width="40" height="110"/>
          <rect x="70" y="175" width="28" height="145"/>
          <rect x="110" y="145" width="55" height="175"/>
          <rect x="175" y="190" width="35" height="130"/>
          <path d="M220 320 V130 H245 V95 H270 V130 H300 V320 Z"/>
          <rect x="320" y="160" width="70" height="160"/>
          <rect x="400" y="120" width="22" height="200"/>
          <rect x="435" y="185" width="50" height="135"/>
          <rect x="500" y="100" width="60" height="220"/>
          <rect x="575" y="155" width="40" height="165"/>
          <path d="M630 320 V110 H655 L680 70 V110 H710 V320 Z"/>
          <rect x="730" y="170" width="55" height="150"/>
          <rect x="800" y="130" width="30" height="190"/>
          <rect x="845" y="195" width="65" height="125"/>
          <rect x="925" y="115" width="45" height="205"/>
          <rect x="985" y="165" width="50" height="155"/>
          <path d="M1050 320 V125 H1075 V85 H1100 V125 H1130 V320 Z"/>
          <rect x="1150" y="180" width="55" height="140"/>
          <rect x="1220" y="140" width="35" height="180"/>
          <rect x="1270" y="200" width="50" height="120"/>
          <rect x="1340" y="155" width="70" height="165"/>
        </g>

        <!-- ближний ряд: персиковый фасад + лавандовый бок (объём как на рефе) -->
        <g>
          <!-- низкий блок -->
          <rect x="0" y="245" width="48" height="75" fill="#f7d9a8"/>
          <rect x="48" y="245" width="16" height="75" fill="#a8aef0"/>
          <!-- средний -->
          <rect x="72" y="195" width="36" height="125" fill="#fce4bc"/>
          <rect x="108" y="195" width="14" height="125" fill="#9ba3e8"/>
          <!-- art-deco ступени -->
          <path d="M130 320 V175 H155 V145 H180 V175 H210 V320 Z" fill="#f5d0a0"/>
          <path d="M210 320 V175 H222 V145 H210 Z" fill="#b0b6f2"/>
          <!-- широкий -->
          <rect x="230" y="220" width="70" height="100" fill="#f8dfb4"/>
          <rect x="300" y="220" width="22" height="100" fill="#a5abe8"/>
          <!-- высокая башня -->
          <rect x="330" y="95" width="42" height="225" fill="#f3c890"/>
          <rect x="372" y="95" width="16" height="225" fill="#8f97de"/>
          <!-- низкий рядом -->
          <rect x="396" y="205" width="55" height="115" fill="#fce8c4"/>
          <rect x="451" y="205" width="16" height="115" fill="#b4baf0"/>
          <!-- кластер -->
          <path d="M475 320 V140 H510 V100 H545 V140 H585 V320 Z" fill="#f6d4a4"/>
          <path d="M585 320 V140 H600 V100 H585 Z" fill="#9ca4e6"/>
          <!-- тонкая игла -->
          <rect x="610" y="70" width="18" height="250" fill="#efc080"/>
          <rect x="628" y="70" width="8" height="250" fill="#858dd8"/>
          <!-- широкий mid -->
          <rect x="645" y="165" width="75" height="155" fill="#f8e0b8"/>
          <rect x="720" y="165" width="22" height="155" fill="#a8aef0"/>
          <!-- главная башня -->
          <path d="M750 320 V85 H785 L815 35 V85 H855 V320 Z" fill="#f2c68c"/>
          <path d="M855 320 V85 H872 V35 H855 Z" fill="#8a92dc"/>
          <!-- низкий -->
          <rect x="880" y="215" width="60" height="105" fill="#fce6c0"/>
          <rect x="940" y="215" width="18" height="105" fill="#b0b6f2"/>
          <!-- mid tower -->
          <rect x="968" y="125" width="50" height="195" fill="#f5d2a0"/>
          <rect x="1018" y="125" width="18" height="195" fill="#959ddc"/>
          <!-- ступени -->
          <path d="M1045 320 V150 H1075 V110 H1105 V150 H1140 V320 Z" fill="#f7dbb0"/>
          <path d="M1140 320 V150 H1155 V110 H1140 Z" fill="#a5abe8"/>
          <!-- правый блок -->
          <rect x="1165" y="185" width="65" height="135" fill="#f8e0b8"/>
          <rect x="1230" y="185" width="20" height="135" fill="#9ba3e8"/>
          <!-- высокая справа -->
          <path d="M1260 320 V100 H1290 L1315 55 V100 H1350 V320 Z" fill="#f0c488"/>
          <path d="M1350 320 V100 H1365 V55 H1350 Z" fill="#868ed6"/>
          <rect x="1375" y="200" width="65" height="120" fill="#fce8c4"/>

          <!-- тонкие окна на фасадах -->
          <g fill="#c4a070" opacity="0.45">
            <rect x="340" y="115" width="3" height="12"/><rect x="350" y="115" width="3" height="12"/><rect x="360" y="115" width="3" height="12"/>
            <rect x="340" y="140" width="3" height="12"/><rect x="350" y="140" width="3" height="12"/><rect x="360" y="140" width="3" height="12"/>
            <rect x="340" y="165" width="3" height="12"/><rect x="350" y="165" width="3" height="12"/><rect x="360" y="165" width="3" height="12"/>
            <rect x="340" y="190" width="3" height="12"/><rect x="350" y="190" width="3" height="12"/><rect x="360" y="190" width="3" height="12"/>
            <rect x="340" y="215" width="3" height="12"/><rect x="350" y="215" width="3" height="12"/><rect x="360" y="215" width="3" height="12"/>
            <rect x="490" y="155" width="3" height="10"/><rect x="505" y="155" width="3" height="10"/><rect x="520" y="155" width="3" height="10"/><rect x="535" y="155" width="3" height="10"/><rect x="550" y="155" width="3" height="10"/>
            <rect x="490" y="180" width="3" height="10"/><rect x="505" y="180" width="3" height="10"/><rect x="520" y="180" width="3" height="10"/><rect x="535" y="180" width="3" height="10"/><rect x="550" y="180" width="3" height="10"/>
            <rect x="490" y="205" width="3" height="10"/><rect x="505" y="205" width="3" height="10"/><rect x="520" y="205" width="3" height="10"/><rect x="535" y="205" width="3" height="10"/><rect x="550" y="205" width="3" height="10"/>
            <rect x="765" y="100" width="3" height="12"/><rect x="780" y="100" width="3" height="12"/><rect x="795" y="100" width="3" height="12"/><rect x="810" y="100" width="3" height="12"/><rect x="825" y="100" width="3" height="12"/>
            <rect x="765" y="125" width="3" height="12"/><rect x="780" y="125" width="3" height="12"/><rect x="795" y="125" width="3" height="12"/><rect x="810" y="125" width="3" height="12"/><rect x="825" y="125" width="3" height="12"/>
            <rect x="765" y="150" width="3" height="12"/><rect x="780" y="150" width="3" height="12"/><rect x="795" y="150" width="3" height="12"/><rect x="810" y="150" width="3" height="12"/><rect x="825" y="150" width="3" height="12"/>
            <rect x="765" y="175" width="3" height="12"/><rect x="780" y="175" width="3" height="12"/><rect x="795" y="175" width="3" height="12"/><rect x="810" y="175" width="3" height="12"/><rect x="825" y="175" width="3" height="12"/>
            <rect x="980" y="145" width="3" height="11"/><rect x="992" y="145" width="3" height="11"/><rect x="1004" y="145" width="3" height="11"/>
            <rect x="980" y="170" width="3" height="11"/><rect x="992" y="170" width="3" height="11"/><rect x="1004" y="170" width="3" height="11"/>
            <rect x="980" y="195" width="3" height="11"/><rect x="992" y="195" width="3" height="11"/><rect x="1004" y="195" width="3" height="11"/>
            <rect x="1275" y="115" width="3" height="11"/><rect x="1290" y="115" width="3" height="11"/><rect x="1305" y="115" width="3" height="11"/><rect x="1320" y="115" width="3" height="11"/>
            <rect x="1275" y="140" width="3" height="11"/><rect x="1290" y="140" width="3" height="11"/><rect x="1305" y="140" width="3" height="11"/><rect x="1320" y="140" width="3" height="11"/>
            <rect x="1275" y="165" width="3" height="11"/><rect x="1290" y="165" width="3" height="11"/><rect x="1305" y="165" width="3" height="11"/><rect x="1320" y="165" width="3" height="11"/>
          </g>
        </g>

        <!-- лёгкая дымка у основания -->
        <rect x="0" y="280" width="1440" height="40" fill="url(#haze)" opacity="0.55"/>

        <!-- пальмы — тёмно-фиолетовые силуэты (как на рефе) -->
        <g fill="#3b2458">
          <!-- дальние мелкие -->
          <g fill="#6a5a8a" opacity="0.85">
            <path d="M55 320 C56 280 54 250 58 220 C20 205 8 185 5 165 C25 175 42 190 58 210 C48 185 32 165 15 150 C35 160 50 180 60 208 C72 178 95 160 120 150 C100 168 78 190 64 215 C85 200 110 190 135 188 C105 205 80 220 62 238 L58 320 Z"/>
            <path d="M1380 320 C1382 275 1378 240 1384 205 C1340 188 1325 165 1320 140 C1345 152 1365 172 1382 195 C1370 165 1350 140 1328 122 C1352 135 1372 160 1386 195 C1400 158 1430 135 1465 122 C1440 145 1410 172 1390 200 C1418 180 1450 165 1480 160 C1445 182 1410 205 1388 228 L1384 320 Z"/>
          </g>

          <!-- левая крупная -->
          <path d="M95 320
            C97 260 92 210 100 155
            C45 135 18 105 8 75
            C40 90 70 115 98 145
            C78 100 48 65 20 40
            C55 55 82 95 104 140
            C115 90 150 50 195 28
            C155 55 125 100 108 148
            C145 120 190 100 240 92
            C185 118 140 145 112 175
            C160 155 215 145 265 145
            C200 165 145 190 110 220
            L100 320 Z"/>

          <!-- правая крупная -->
          <path d="M1285 320
            C1288 255 1282 200 1292 140
            C1230 118 1195 85 1182 50
            C1218 68 1255 95 1290 128
            C1265 80 1230 42 1195 18
            C1235 35 1270 75 1295 122
            C1308 70 1350 30 1405 8
            C1358 35 1320 80 1300 128
            C1345 98 1400 75 1455 68
            C1390 95 1335 125 1305 158
            C1360 140 1420 130 1475 132
            C1405 155 1340 185 1300 220
            L1292 320 Z"/>

          <!-- средняя правее центра -->
          <path d="M1120 320
            C1122 270 1118 230 1125 185
            C1085 168 1065 145 1058 120
            C1080 132 1100 150 1123 175
            C1110 145 1090 120 1068 100
            C1092 112 1112 138 1126 172
            C1138 138 1165 115 1200 100
            C1170 120 1145 145 1130 175
            C1160 158 1195 148 1230 145
            C1190 165 1150 185 1128 210
            L1125 320 Z"/>
        </g>
      </svg>
</template>

<script setup>
</script>
