import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, SafeAreaView, ActivityIndicator, Alert, Platform,
} from 'react-native';
import { fetchChildren, createChildWithProfile, deleteChild } from '../services/supabase';
import { insertParentalConsent } from '../services/database';

const TERMS_VERSION = 'v1.0';
import { THEME_COLORS, FONT_SIZES, FONT_WEIGHTS } from '../styles/theme';
import { Plus, Trash2 } from 'lucide-react-native';

const AVATAR_OPTIONS = [
  { key: 'panda',  emoji: '🐼', label: 'Panda' },
  { key: 'fox',    emoji: '🦊', label: 'Raposa' },
  { key: 'kitten', emoji: '🐱', label: 'Gatinho' },
  { key: 'robot',  emoji: '🤖', label: 'Robô' },
  { key: 'boy',    emoji: '👦', label: 'Menino' },
  { key: 'girl',   emoji: '👧', label: 'Menina' },
] as const;

function emojiFor(avatar: string) {
  return AVATAR_OPTIONS.find(a => a.key === avatar)?.emoji ?? '😊';
}

interface Props {
  parentId: string;
  isPremium: boolean;
  onSelectChild: (childId: string) => void;
}

export const ChildSelectorScreen: React.FC<Props> = ({ parentId, isPremium, onSelectChild }) => {
  const [children, setChildren] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newAvatar, setNewAvatar] = useState<string>('panda');
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState('');
  const [consentGiven, setConsentGiven] = useState(false);

  const MAX_CHILDREN = isPremium ? 5 : 2;

  const loadChildren = async () => {
    setLoading(true);
    const kids = await fetchChildren();
    setChildren(kids);
    setLoading(false);
  };

  useEffect(() => {
    loadChildren();
  }, []);

  const handleCreate = async () => {
    const trimmed = newName.trim();
    if (!trimmed) {
      setFormError('Digite o nome da criança.');
      return;
    }
    if (!consentGiven) {
      setFormError('É necessário confirmar o consentimento parental para continuar.');
      return;
    }
    setCreating(true);
    setFormError('');
    const child = await createChildWithProfile(parentId, trimmed, 6, newAvatar);
    if (child) {
      try {
        await insertParentalConsent(parentId, child.id, TERMS_VERSION);
      } catch {
        // Consent failure is non-blocking; log but continue
        console.warn('Aviso: falha ao registrar consentimento parental');
      }
      onSelectChild(child.id);
    } else {
      setFormError('Não foi possível criar o perfil. Verifique sua conexão.');
    }
    setCreating(false);
  };

  const handleDelete = (child: any) => {
    Alert.alert(
      'Remover criança',
      `Tem certeza que deseja remover o perfil de "${child.name}"? Todo o progresso será perdido.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            const ok = await deleteChild(child.id);
            if (ok) loadChildren();
          },
        },
      ]
    );
  };

  const cancelForm = () => {
    setShowForm(false);
    setNewName('');
    setNewAvatar('panda');
    setFormError('');
    setConsentGiven(false);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#7B1FA2" style={{ marginTop: 80 }} />
      </SafeAreaView>
    );
  }

  const isFirstTime = children.length === 0;
  const canAdd = children.length < MAX_CHILDREN;
  const showFormInline = showForm || isFirstTime;

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.inner, Platform.OS === 'web' && styles.innerWeb]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.emoji}>🎮</Text>
          <Text style={styles.title}>
            {isFirstTime ? 'Vamos começar!' : 'Quem vai jogar?'}
          </Text>
          {!isFirstTime && (
            <Text style={styles.subtitle}>Toque no perfil da criança para jogar</Text>
          )}
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Children cards */}
          {!isFirstTime && children.map((child) => (
            <View key={child.id} style={styles.childRow}>
              <TouchableOpacity
                style={styles.childCard}
                activeOpacity={0.82}
                onPress={() => onSelectChild(child.id)}
              >
                <Text style={styles.childEmoji}>{emojiFor(child.avatar)}</Text>
                <View style={styles.childMeta}>
                  <Text style={styles.childName}>{child.name}</Text>
                  <Text style={styles.childHint}>Toque para jogar ▶</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => handleDelete(child)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Trash2 size={18} color="#B0BEC5" />
              </TouchableOpacity>
            </View>
          ))}

          {/* Add button */}
          {!showFormInline && canAdd && (
            <TouchableOpacity
              style={styles.addBtn}
              activeOpacity={0.8}
              onPress={() => setShowForm(true)}
            >
              <Plus size={20} color="#7B1FA2" />
              <Text style={styles.addBtnText}>Adicionar criança</Text>
            </TouchableOpacity>
          )}

          {/* Premium gate for adding more children */}
          {!showFormInline && !canAdd && (
            <View style={styles.limitBanner}>
              <Text style={styles.limitText}>
                ⭐ Plano Premium permite até 5 perfis de crianças
              </Text>
            </View>
          )}

          {/* Create form */}
          {showFormInline && (
            <View style={styles.form}>
              <Text style={styles.formTitle}>
                {isFirstTime ? 'Criar primeiro perfil' : 'Nova criança'}
              </Text>

              <Text style={styles.formLabel}>Nome da criança</Text>
              <TextInput
                style={styles.input}
                value={newName}
                onChangeText={setNewName}
                placeholder="Ex: Ana, João, Mia..."
                maxLength={30}
                autoFocus={isFirstTime}
                returnKeyType="done"
                onSubmitEditing={handleCreate}
              />

              <Text style={styles.formLabel}>Escolha o avatar</Text>
              <View style={styles.avatarGrid}>
                {AVATAR_OPTIONS.map((av) => (
                  <TouchableOpacity
                    key={av.key}
                    style={[
                      styles.avatarBtn,
                      newAvatar === av.key && styles.avatarBtnSelected,
                    ]}
                    onPress={() => setNewAvatar(av.key)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.avatarEmoji}>{av.emoji}</Text>
                    <Text style={styles.avatarLabel}>{av.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Consentimento parental LGPD/COPPA */}
              <TouchableOpacity
                style={styles.consentRow}
                activeOpacity={0.7}
                onPress={() => setConsentGiven(v => !v)}
              >
                <View style={[styles.checkbox, consentGiven && styles.checkboxChecked]}>
                  {consentGiven && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.consentText}>
                  Sou o responsável legal desta criança e concordo com a Política de Privacidade e Termos de Uso ({TERMS_VERSION}).
                </Text>
              </TouchableOpacity>

              {formError ? (
                <Text style={styles.errorText}>{formError}</Text>
              ) : null}

              <View style={styles.formButtons}>
                {!isFirstTime && (
                  <TouchableOpacity style={styles.cancelBtn} onPress={cancelForm}>
                    <Text style={styles.cancelBtnText}>Cancelar</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={[styles.createBtn, creating && styles.createBtnDisabled]}
                  onPress={handleCreate}
                  disabled={creating}
                >
                  {creating
                    ? <ActivityIndicator size="small" color="#FFF" />
                    : <Text style={styles.createBtnText}>
                        {isFirstTime ? '🚀 Começar!' : 'Criar perfil'}
                      </Text>
                  }
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EDE7F6',
  },
  inner: {
    flex: 1,
  },
  innerWeb: {
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 10,
  },
  title: {
    fontSize: FONT_SIZES.title,
    fontWeight: FONT_WEIGHTS.extraBold,
    color: '#4A148C',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FONT_SIZES.caption,
    color: '#7E57C2',
    marginTop: 6,
    textAlign: 'center',
  },
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  childRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  childCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 2,
    borderColor: '#CE93D8',
    shadowColor: '#7B1FA2',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  childEmoji: {
    fontSize: 44,
    marginRight: 14,
  },
  childMeta: {
    flex: 1,
  },
  childName: {
    fontSize: FONT_SIZES.subheading,
    fontWeight: FONT_WEIGHTS.extraBold,
    color: '#4A148C',
  },
  childHint: {
    fontSize: FONT_SIZES.micro,
    color: '#9575CD',
    marginTop: 3,
  },
  deleteBtn: {
    padding: 10,
    marginLeft: 8,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#CE93D8',
    borderRadius: 20,
    paddingVertical: 16,
    marginBottom: 12,
    backgroundColor: '#F3E5F5',
  },
  addBtnText: {
    fontSize: FONT_SIZES.body,
    fontWeight: FONT_WEIGHTS.bold,
    color: '#7B1FA2',
    marginLeft: 8,
  },
  limitBanner: {
    backgroundColor: '#FFF8E1',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#FFD54F',
    marginBottom: 12,
  },
  limitText: {
    fontSize: FONT_SIZES.caption,
    color: '#E65100',
    textAlign: 'center',
    fontWeight: FONT_WEIGHTS.bold,
  },
  form: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 22,
    borderWidth: 2,
    borderColor: '#CE93D8',
    shadowColor: '#7B1FA2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  formTitle: {
    fontSize: FONT_SIZES.heading,
    fontWeight: FONT_WEIGHTS.extraBold,
    color: '#4A148C',
    marginBottom: 18,
    textAlign: 'center',
  },
  formLabel: {
    fontSize: FONT_SIZES.caption,
    fontWeight: FONT_WEIGHTS.bold,
    color: '#6A1B9A',
    marginBottom: 8,
    marginTop: 4,
  },
  input: {
    height: 50,
    borderWidth: 2,
    borderColor: '#CE93D8',
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: FONT_SIZES.body,
    color: '#37474F',
    backgroundColor: '#FAFAFA',
    marginBottom: 16,
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  avatarBtn: {
    width: '30%',
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    backgroundColor: '#FAFAFA',
    marginBottom: 10,
  },
  avatarBtnSelected: {
    borderColor: '#7B1FA2',
    backgroundColor: '#EDE7F6',
  },
  avatarEmoji: {
    fontSize: 30,
  },
  avatarLabel: {
    fontSize: FONT_SIZES.micro,
    color: '#546E7A',
    marginTop: 4,
    fontWeight: FONT_WEIGHTS.bold,
  },
  consentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
    marginTop: 4,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#9575CD',
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    flexShrink: 0,
    marginTop: 1,
  },
  checkboxChecked: {
    backgroundColor: '#7B1FA2',
    borderColor: '#4A148C',
  },
  checkmark: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: FONT_WEIGHTS.extraBold,
    lineHeight: 16,
  },
  consentText: {
    flex: 1,
    fontSize: FONT_SIZES.micro,
    color: '#546E7A',
    lineHeight: 18,
  },
  errorText: {
    color: '#D32F2F',
    fontSize: FONT_SIZES.micro,
    fontWeight: FONT_WEIGHTS.bold,
    textAlign: 'center',
    marginBottom: 10,
  },
  formButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 4,
  },
  cancelBtn: {
    paddingVertical: 13,
    paddingHorizontal: 20,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#B0BEC5',
    backgroundColor: '#ECEFF1',
  },
  cancelBtnText: {
    fontSize: FONT_SIZES.body,
    fontWeight: FONT_WEIGHTS.bold,
    color: '#546E7A',
  },
  createBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#7B1FA2',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#4A148C',
    shadowColor: '#4A148C',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  createBtnDisabled: {
    opacity: 0.7,
  },
  createBtnText: {
    fontSize: FONT_SIZES.body,
    fontWeight: FONT_WEIGHTS.extraBold,
    color: '#FFF',
  },
});
