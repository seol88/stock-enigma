import { component$, $, useSignal } from '@builder.io/qwik';
import { authClient } from '../../lib/auth-client';

export default component$(() => {
  const email = useSignal('');
  const password = useSignal('');
  const errorMsg = useSignal('');
  const loading = useSignal(false);
  const showPassword = useSignal(false);
  const rememberMe = useSignal(false);

  const handleLogin = $(async () => {
    if (!email.value || !password.value) {
      errorMsg.value = 'Por favor, completa todos los campos.';
      return;
    }

    loading.value = true;
    errorMsg.value = '';
    
    const { error } = await authClient.signIn.email({
      email: email.value,
      password: password.value,
    });
    
    if (error) {
      errorMsg.value = error.message || 'Credenciales incorrectas';
      loading.value = false;
    } else {
      window.location.href = '/';
    }
  });

  return (
    <div class="min-h-screen flex flex-col items-center justify-center p-6 bg-[#FDFBF7] text-[#1A1A2E]">
      
      {/* Contenedor Principal */}
      <div class="w-full max-w-[400px]">
        {/* Logo Circular */}
        <div class="flex justify-center mb-6">
          <div class="w-32 h-32 rounded-full bg-gradient-to-tr from-[#D946EF] to-[#9333EA] flex items-center justify-center shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-white opacity-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        
        {/* Título */}
        <div class="text-center mb-8">
          <h2 class="text-[28px] font-extrabold leading-tight text-[#6B21A8]">
            Librería Enigma
          </h2>
          <p class="text-[#4B5563] mt-2 font-medium">
            Gestión inteligente para tu librería y regalería.
          </p>
        </div>
        
        {errorMsg.value && (
          <div class="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 border border-red-200">
            {errorMsg.value}
          </div>
        )}

        {/* Formulario */}
        <div class="space-y-5">
          {/* Email */}
          <div>
            <label class="block text-sm font-bold text-[#111827] mb-1.5">
              Correo Electrónico
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <input 
                type="email" 
                placeholder="nombre@ejemplo.com" 
                class="block w-full pl-10 pr-3 py-3 border border-[#E5E7EB] rounded-xl bg-[#F3F4F6]/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent transition-all"
                bind:value={email}
                onKeyDown$={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>
          </div>
          
          {/* Contraseña */}
          <div>
            <label class="block text-sm font-bold text-[#111827] mb-1.5">
              Contraseña
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <input 
                type={showPassword.value ? "text" : "password"}
                placeholder="••••••••" 
                class="block w-full pl-10 pr-10 py-3 border border-[#E5E7EB] rounded-xl bg-[#F3F4F6]/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent transition-all"
                bind:value={password}
                onKeyDown$={(e) => e.key === 'Enter' && handleLogin()}
              />
              <button 
                type="button" 
                class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                onClick$={() => showPassword.value = !showPassword.value}
              >
                {showPassword.value ? (
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                )}
              </button>
            </div>
            
            <div class="flex justify-end mt-2">
              <a href="#" class="text-sm font-semibold text-[#7C3AED] hover:underline">
                ¿Olvidaste tu contraseña?
              </a>
            </div>
          </div>

          <div class="flex items-center mt-2 mb-6">
            <input 
              type="checkbox" 
              id="remember" 
              class="w-4 h-4 text-[#7C3AED] bg-white border-gray-300 rounded focus:ring-[#7C3AED] accent-[#7C3AED]"
              bind:checked={rememberMe}
            />
            <label for="remember" class="ml-2 text-sm text-[#4B5563]">
              Mantener sesión iniciada
            </label>
          </div>
          
          {/* Botón */}
          <button 
            class="w-full py-3.5 px-4 bg-[#6B21A8] hover:bg-[#581C87] text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-[#6B21A8]/30"
            onClick$={handleLogin}
            disabled={loading.value}
          >
            {loading.value ? (
              <span class="loading loading-spinner w-5 h-5"></span>
            ) : (
              <>
                Ingresar
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </>
            )}
          </button>
        </div>
      </div>
      
    </div>
  );
});
