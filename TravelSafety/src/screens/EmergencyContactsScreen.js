import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  FlatList,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { emergencyAPI, authAPI } from '../services/api';

const EmergencyContactsScreen = ({ onBack }) => {
  const { user, checkAuthState } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    relationship: '',
    email: '',
  });

  useEffect(() => {
    loadContacts();
  }, [user?.emergencyContacts]);

  const loadContacts = () => {
    if (user?.emergencyContacts) {
      setContacts(user.emergencyContacts);
    }
  };

  const refreshUserData = async () => {
    try {
      const userResponse = await authAPI.getCurrentUser();
      if (userResponse.success) {
        setContacts(userResponse.user.emergencyContacts || []);
      }
    } catch (error) {
      console.log('Error refreshing user data:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = () => {
    const { name, phone, relationship } = formData;
    
    if (!name.trim() || !phone.trim() || !relationship.trim()) {
      Alert.alert('Error', 'Please fill in all required fields (Name, Phone, Relationship)');
      return false;
    }

    if (phone.length < 10) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return false;
    }

    return true;
  };

  const handleSaveContact = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      if (editingContact) {
        // Update existing contact
        const response = await emergencyAPI.updateEmergencyContact(editingContact._id, formData);
        if (response.success) {
          Alert.alert('Success', 'Emergency contact updated successfully');
          // Update contacts immediately from response
          setContacts(response.emergencyContacts || []);
          setShowAddModal(false);
          setEditingContact(null);
          resetForm();
        }
      } else {
        // Add new contact
        if (contacts.length >= 3) {
          Alert.alert('Limit Reached', 'You can only add up to 3 emergency contacts');
          return;
        }

        const response = await emergencyAPI.addEmergencyContact(formData);
        if (response.success) {
          const newContacts = response.emergencyContacts || [];
          Alert.alert('Success', `Emergency contact added successfully!\n\nYou now have ${newContacts.length}/3 contacts.`);
          // Update contacts immediately from response
          setContacts(newContacts);
          setShowAddModal(false);
          resetForm();
        }
      }
    } catch (error) {
      console.error('Emergency contact error:', error.response?.data);
      const errorMessage = error.response?.data?.message || 'Failed to save contact';
      const validationErrors = error.response?.data?.errors;
      
      if (validationErrors && validationErrors.length > 0) {
        const errorDetails = validationErrors.map(err => `${err.param}: ${err.msg}`).join('\n');
        Alert.alert('Validation Error', errorDetails);
      } else {
        Alert.alert('Error', errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteContact = (contactId) => {
    Alert.alert(
      'Delete Contact',
      'Are you sure you want to delete this emergency contact?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteContact(contactId),
        },
      ]
    );
  };

  const deleteContact = async (contactId) => {
    try {
      const response = await emergencyAPI.deleteEmergencyContact(contactId);
      if (response.success) {
        Alert.alert('Success', 'Emergency contact deleted successfully');
        // Update contacts immediately from response
        setContacts(response.emergencyContacts || []);
      }
    } catch (error) {
      console.error('Delete contact error:', error.response?.data);
      Alert.alert('Error', error.response?.data?.message || 'Failed to delete contact');
    }
  };

  const handleEditContact = (contact) => {
    setEditingContact(contact);
    setFormData({
      name: contact.name,
      phone: contact.phone,
      relationship: contact.relationship,
      email: contact.email || '',
    });
    setShowAddModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      relationship: '',
      email: '',
    });
    setEditingContact(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingContact(null);
    resetForm();
  };

  const renderContact = ({ item }) => (
    <View style={styles.contactCard}>
      <View style={styles.contactInfo}>
        <Text style={styles.contactName}>{item.name}</Text>
        <Text style={styles.contactRelationship}>{item.relationship}</Text>
        <Text style={styles.contactPhone}>{item.phone}</Text>
        {item.email && <Text style={styles.contactEmail}>{item.email}</Text>}
      </View>
      <View style={styles.contactActions}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => handleEditContact(item)}
        >
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteContact(item._id)}
        >
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Emergency Contacts</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoText}>
          📞 Add up to 3 emergency contacts who will be notified in case of emergency
        </Text>
        <Text style={styles.contactCount}>
          {contacts.length}/3 contacts added
        </Text>
      </View>

      {contacts.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No emergency contacts added yet</Text>
          <Text style={styles.emptyStateSubtext}>
            Add your first emergency contact to get started
          </Text>
        </View>
      ) : (
        <FlatList
          data={contacts}
          renderItem={renderContact}
          keyExtractor={(item) => item._id}
          style={styles.contactsList}
        />
      )}

      {contacts.length < 3 && (
        <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
          <Text style={styles.addButtonText}>+ Add Emergency Contact</Text>
        </TouchableOpacity>
      )}

      {/* Add/Edit Contact Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingContact ? 'Edit Contact' : 'Add Emergency Contact'}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Full Name *"
              value={formData.name}
              onChangeText={(value) => handleInputChange('name', value)}
            />

            <TextInput
              style={styles.input}
              placeholder="Phone Number *"
              value={formData.phone}
              onChangeText={(value) => handleInputChange('phone', value)}
              keyboardType="phone-pad"
            />

            <TextInput
              style={styles.input}
              placeholder="Relationship (e.g., Father, Mother, Friend) *"
              value={formData.relationship}
              onChangeText={(value) => handleInputChange('relationship', value)}
            />

            <TextInput
              style={styles.input}
              placeholder="Email (Optional)"
              value={formData.email}
              onChangeText={(value) => handleInputChange('email', value)}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={closeModal}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
                onPress={handleSaveContact}
                disabled={isLoading}
              >
                <Text style={styles.saveButtonText}>
                  {isLoading ? 'Saving...' : 'Save'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#3498db',
    fontWeight: '600',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  placeholder: {
    width: 60,
  },
  infoCard: {
    backgroundColor: '#e3f2fd',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#2196f3',
  },
  infoText: {
    fontSize: 14,
    color: '#1976d2',
    marginBottom: 8,
  },
  contactCount: {
    fontSize: 12,
    color: '#1976d2',
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 18,
    color: '#6c757d',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#adb5bd',
    textAlign: 'center',
  },
  contactsList: {
    flex: 1,
    padding: 16,
  },
  contactCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  contactInfo: {
    marginBottom: 12,
  },
  contactName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  contactRelationship: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 4,
  },
  contactPhone: {
    fontSize: 16,
    color: '#495057',
    fontWeight: '500',
  },
  contactEmail: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 4,
  },
  contactActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  editButton: {
    backgroundColor: '#17a2b8',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginRight: 8,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  addButton: {
    backgroundColor: '#28a745',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 24,
    borderRadius: 12,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: '#f8f9fa',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#6c757d',
    padding: 12,
    borderRadius: 8,
    marginRight: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#28a745',
    padding: 12,
    borderRadius: 8,
    marginLeft: 8,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#6c757d',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EmergencyContactsScreen;
