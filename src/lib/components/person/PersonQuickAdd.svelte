<script>
  import Modal from '$lib/components/ui/Modal.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Input from '$lib/components/ui/Input.svelte';
  import Textarea from '$lib/components/ui/Textarea.svelte';
  import { personSchema, extractErrors } from '$lib/utils/validators';
  import { addPerson } from '$lib/stores/persons';
  import { User, Phone, Mail } from '@lucide/svelte';

  /**
   * @type {{
   *   open?: boolean,
   *   initialName?: string,
   *   oncreated?: (person: import('$lib/stores/persons').Person) => void
   * }}
   */
  let {
    open = $bindable(false),
    initialName = '',
    oncreated
  } = $props();

  let name = $state('');
  let phone = $state('');
  let email = $state('');
  let notes = $state('');
  let loading = $state(false);

  /** @type {Record<string, string>} */
  let errors = $state({});

  // Quand la modal s'ouvre, pré-remplir le nom
  $effect(() => {
    if (open) {
      name = initialName;
      phone = '';
      email = '';
      notes = '';
      errors = {};
    }
  });

  /**
   * @param {Event} e
   */
  async function handleSubmit(e) {
    e.preventDefault();
    errors = {};

    const result = personSchema.safeParse({ name, phone, email, notes });
    if (!result.success) {
      errors = extractErrors(result.error);
      return;
    }

    loading = true;
    try {
      const newPerson = await addPerson({ name, phone, email, notes });
      if (newPerson) {
        open = false;
        oncreated?.(newPerson);
      }
    } finally {
      loading = false;
    }
  }
</script>

<Modal bind:open title="Nouvelle personne" size="sm">
  <form onsubmit={handleSubmit} class="space-y-4">
    <Input
      label="Nom"
      bind:value={name}
      placeholder="Nom de la personne"
      error={errors.name}
      icon={User}
      required
    />

    <Input
      label="Téléphone"
      type="tel"
      bind:value={phone}
      placeholder="+237 6XX XXX XXX"
      error={errors.phone}
      icon={Phone}
    />

    <Input
      label="Email"
      type="email"
      bind:value={email}
      placeholder="email@exemple.com"
      error={errors.email}
      icon={Mail}
    />

    <Textarea
      label="Notes"
      bind:value={notes}
      placeholder="Informations complémentaires (optionnel)"
      error={errors.notes}
      rows={2}
    />

    <div class="flex items-center justify-end gap-3 pt-2">
      <Button variant="secondary" onclick={() => open = false}>
        Annuler
      </Button>
      <Button type="submit" {loading}>
        Ajouter
      </Button>
    </div>
  </form>
</Modal>