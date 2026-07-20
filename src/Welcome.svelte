<script>
  const commands = [
    ['p5 new <collection>', 'Create a collection and shared p5.js library.'],
    ['p5 generate <project>', 'Create a sketch and add it to .p5rc.'],
    ['p5 generate --bundle <project>', 'Create a standalone sketch with its own library.'],
    ['p5 generate --es6 <project>', 'Create an ES6 sketch template.'],
    ['p5 rename <old> <new>', 'Rename a registered sketch.'],
    ['p5 update', 'Download the latest p5.js release.'],
    ['p5 server', 'Start the sketch manager and live reload.'],
  ];
</script>

<div class="welcome">
  <div class="wrapper">
    <h1>Hello p5.js</h1>
    <p class="intro">Generate, organize, and preview your sketches from one place.</p>

    <h2>Command reference</h2>
    <p class="hint">Run these commands in a terminal. The web interface is a browser and does not execute shell commands.</p>

    <div class="commands">
      {#each commands as command}
        <article>
          <code>$ {command[0]}</code>
          <p>{command[1]}</p>
        </article>
      {/each}
    </div>
  </div>
</div>

<style>
  .welcome {
    height: 100%;
    overflow-y: auto;
  }

  .wrapper {
    width: min(900px, calc(100% - 48px));
    margin: 0 auto;
    padding: 90px 0 48px;
    text-align: left;
    box-sizing: border-box;
  }

  h1 {
    margin: 0;
    font-size: clamp(48px, 9vw, 80px);
    color: #f07;
  }

  .intro {
    margin: 4px 0 48px;
    color: #666;
    font-size: 18px;
  }

  h2 {
    margin: 0 0 8px;
    color: #333;
  }

  .hint {
    margin: 0 0 20px;
    color: #666;
  }

  .commands {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(320px, 100%), 1fr));
    gap: 12px;
  }

  article {
    padding: 18px;
    border-left: 4px solid #f07;
    border-radius: 4px;
    background: #333;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  }

  code {
    color: #f07;
    font-size: 15px;
    overflow-wrap: anywhere;
  }

  article p {
    margin: 8px 0 0;
    color: #ddd;
    line-height: 1.4;
  }
</style>
