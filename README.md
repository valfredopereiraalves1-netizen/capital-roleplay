# Capital Roleplay

Site público da comunidade Capital Roleplay no Roblox, com identidade visual preta e dourada.

## Arquivos
- `index.html`: página pública e formulário de inscrições.
- `admin.html`: acesso ao painel administrativo.
- `styles.css`: layout responsivo e identidade visual.
- `app.js`: inscrições e comunicados.
- `admin.js`: autenticação e gestão administrativa.
- `config.js`: configuração pública do Supabase.

## Configuração do Supabase
O projeto usa `https://hjtauumjxanryzfcodfw.supabase.co`.

1. Abra `config.js` e substitua `COLE_AQUI_SUA_CHAVE_ANON_PUBLIC` pela chave **anon/public** do Supabase.
2. Nunca coloque a chave `service_role`, senhas ou segredos no frontend.
3. Confirme políticas RLS para permitir envio público de inscrições, leitura apenas de comunicados publicados e gestão restrita a administradores.
4. A tabela `admin_users` deve permitir que o usuário autenticado consulte apenas sua própria autorização. Toda operação administrativa deve ser validada no banco por RLS.

## Publicação
Para GitHub Pages: abra Settings → Pages → Deploy from a branch → branch `main` → pasta `/(root)` → Save. Aguarde a publicação.

## Segurança
O painel usa Supabase Auth e a tabela `admin_users`. A proteção efetiva depende das políticas RLS no banco; não confie apenas no JavaScript do navegador. Revise as políticas antes de publicar.
