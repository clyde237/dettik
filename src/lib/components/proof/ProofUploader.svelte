<script>
  import { X, Upload, FileImage, FileText } from '@lucide/svelte';
  import { proofSchema, extractErrors } from '$lib/utils/validators';
  import { toastError } from '$lib/stores/notifications';

  /**
   * @type {{
   *   files?: File[],
   *   class?: string
   * }}
   */
  let {
    files = $bindable([]),
    class: className = ''
  } = $props();

  let dragOver = $state(false);

  /** @type {Array<{ file: File, preview: string }>} */
  let previews = $state([]);

  /**
   * @param {File} file
   * @returns {boolean}
   */
  function validateFile(file) {
    const result = proofSchema.safeParse({
      file_name: file.name,
      file_type: file.type,
      file_size: file.size
    });

    if (!result.success) {
      const errors = extractErrors(result.error);
      const message = Object.values(errors)[0];
      toastError(`${file.name} : ${message}`);
      return false;
    }
    return true;
  }

  /**
   * @param {File[]} newFiles
   */
  function addFiles(newFiles) {
    for (const file of newFiles) {
      if (!validateFile(file)) continue;

      // Éviter les doublons
      if (files.some((f) => f.name === file.name && f.size === file.size)) continue;

      files = [...files, file];

      // Créer preview
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          previews = [...previews, { file, preview: /** @type {string} */ (e.target?.result) }];
        };
        reader.readAsDataURL(file);
      } else {
        previews = [...previews, { file, preview: '' }];
      }
    }
  }

  /**
   * @param {File} file
   */
  function removeFile(file) {
    files = files.filter((f) => f !== file);
    previews = previews.filter((p) => p.file !== file);
  }

  /**
   * @param {DragEvent} e
   */
  function handleDrop(e) {
    e.preventDefault();
    dragOver = false;
    const droppedFiles = Array.from(e.dataTransfer?.files || []);
    addFiles(droppedFiles);
  }

  /**
   * @param {Event} e
   */
  function handleInput(e) {
    const target = /** @type {HTMLInputElement} */ (e.target);
    const selectedFiles = Array.from(target.files || []);
    addFiles(selectedFiles);
    target.value = '';
  }

  /**
   * @param {number} bytes
   * @returns {string}
   */
  function formatSize(bytes) {
    if (bytes < 1024) return `${bytes} o`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
  }
</script>

<div class={className}>
  <label class="block text-sm font-medium text-gray-700 mb-2">
    Preuves de paiement (optionnel)
  </label>

  <!-- Zone de drop -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="border-2 border-dashed rounded-xl p-6 text-center transition cursor-pointer
      {dragOver ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-gray-400'}"
    ondragover={(e) => { e.preventDefault(); dragOver = true; }}
    ondragleave={() => dragOver = false}
    ondrop={handleDrop}
    onclick={() => document.getElementById('proof-input')?.click()}
  >
    <Upload size={24} class="mx-auto mb-2 {dragOver ? 'text-green-500' : 'text-gray-400'}" />
    <p class="text-sm text-gray-600">
      Glisser des fichiers ici ou <span class="text-green-600 font-medium">parcourir</span>
    </p>
    <p class="text-xs text-gray-400 mt-1">JPG, PNG, WebP ou PDF • 5 MB max</p>
  </div>

  <input
    id="proof-input"
    type="file"
    accept="image/jpeg,image/png,image/webp,application/pdf"
    multiple
    class="hidden"
    oninput={handleInput}
  />

  <!-- Previews -->
  {#if previews.length > 0}
    <div class="grid grid-cols-3 gap-3 mt-3">
      {#each previews as { file, preview }}
        <div class="relative group">
          {#if preview}
            <div class="aspect-square rounded-lg overflow-hidden border border-gray-200">
              <img src={preview} alt={file.name} class="w-full h-full object-cover" />
            </div>
          {:else}
            <div class="aspect-square rounded-lg border border-gray-200 flex flex-col items-center justify-center p-2 bg-gray-50">
              {#if file.type === 'application/pdf'}
                <FileText size={24} class="text-red-400 mb-1" />
              {:else}
                <FileImage size={24} class="text-gray-400 mb-1" />
              {/if}
              <span class="text-[10px] text-gray-500 truncate w-full text-center">{file.name}</span>
            </div>
          {/if}

          <!-- Badge taille -->
          <span class="absolute bottom-1 left-1 text-[9px] bg-black/60 text-white px-1.5 py-0.5 rounded">
            {formatSize(file.size)}
          </span>

          <!-- Bouton supprimer -->
          <button
            type="button"
            onclick={() => removeFile(file)}
            class="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full
              flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow"
          >
            <X size={12} />
          </button>
        </div>
      {/each}
    </div>
  {/if}
</div>