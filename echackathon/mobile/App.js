import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, StatusBar, Platform } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Plus, LayoutGrid, User, Power, Thermometer, Wind, Grid2X2, Lock, Video, VideoOff, Upload } from 'lucide-react-native';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import { Video as ExpoVideo } from 'expo-av';

const VideoCard = ({ device, onToggle, onUpload, baseUrl }) => {
  const isActive = device.status;
  const videoSource = device.video_url ? { uri: `${baseUrl}${device.video_url}` } : null;
  
  return (
    <View style={styles.videoCard}>
      <View style={styles.videoPreview}>
        {isActive ? (
          <View style={styles.videoActive}>
            {videoSource ? (
              <ExpoVideo
                source={videoSource}
                rate={1.0}
                volume={1.0}
                isMuted={false}
                resizeMode="cover"
                shouldPlay
                isLooping
                style={styles.fullVideo}
              />
            ) : (
              <LinearGradient colors={['#1F2937', '#111827']} style={styles.videoContent}>
                <Video size={48} color="#10B981" />
                <View style={styles.liveBadge}><Text style={styles.liveText}>LIVE</Text></View>
              </LinearGradient>
            )}
          </View>
        ) : (
          <View style={[styles.videoContent, styles.videoOffline]}>
            <VideoOff size={48} color="#4B5563" />
            <Text style={styles.offlineText}>Camera Offline</Text>
          </View>
        )}
      </View>
      <View style={styles.videoFooter}>
        <View>
          <Text style={styles.deviceName}>{device.name}</Text>
          <Text style={styles.roomName}>{device.room}</Text>
        </View>
        <View style={styles.videoActions}>
          <TouchableOpacity 
            onPress={() => onUpload(device.id)}
            style={styles.uploadBtn}
          >
            <Upload size={18} color="#94A3B8" />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => onToggle(device.id)}
            style={[styles.powerBtn, isActive && styles.activePowerBtn]}
          >
            <Power size={18} color={isActive ? "#FFFFFF" : "#94A3B8"} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

// Components
const IconButton = ({ Icon, size = 24, color = "#F1F5F9", onPress }) => (
  <TouchableOpacity onPress={onPress} style={styles.iconButton}>
    <Icon size={size} color={color} />
  </TouchableOpacity>
);

const CategoryTab = ({ name, active, onPress }) => (
  <TouchableOpacity onPress={onPress} style={[styles.tab, active && styles.activeTab]}>
    <Text style={[styles.tabText, active && styles.activeTabText]}>{name}</Text>
  </TouchableOpacity>
);

const DeviceCard = ({ device, onToggle }) => {
  const isActive = device.status;
  
  return (
    <View style={styles.deviceCard}>
      <View style={styles.cardHeader}>
        <View style={[styles.iconContainer, isActive && styles.activeIconContainer]}>
          {device.type === 'thermostat' ? (
            <View style={styles.thermostatIcon}>
              <Text style={styles.thermostatValue}>{device.value.replace('°C', '')}</Text>
            </View>
          ) : (
            <Text style={{ fontSize: 24 }}>
              {device.type === 'light' ? '💡' : device.type === 'air_purifier' ? '🌀' : device.type === 'sweeper' ? '🧹' : device.type === 'switch' ? '🔌' : '⚙️'}
            </Text>
          )}
        </View>
        <TouchableOpacity 
          onPress={() => onToggle(device.id)}
          style={[styles.powerBtn, isActive && styles.activePowerBtn]}
        >
          <Power size={16} color={isActive ? "#FFFFFF" : "#94A3B8"} />
        </TouchableOpacity>
      </View>
      <View style={styles.cardInfo}>
        <Text style={styles.deviceName}>{device.name}</Text>
        <Text style={styles.roomName}>{device.room}</Text>
      </View>
    </View>
  );
};

const ACCard = ({ device, onToggle, onSettingUpdate }) => {
  const isActive = device.status;
  
  return (
    <View style={styles.acCard}>
      <View style={styles.acHeader}>
        <View style={styles.acInfo}>
          <Text style={styles.acIcon}>❄️</Text>
          <View>
            <Text style={styles.acTitle}>{device.name}</Text>
            <Text style={styles.roomName}>{device.room}</Text>
          </View>
        </View>
        <TouchableOpacity 
          onPress={() => onToggle(device.id)}
          style={[styles.powerBtn, isActive && styles.activePowerBtn]}
        >
          <Power size={20} color={isActive ? "#FFFFFF" : "#94A3B8"} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.acControls}>
        <TouchableOpacity style={styles.acControlItem} onPress={() => onSettingUpdate(device.id, 'value')}>
            <Thermometer size={20} color="#38BDF8" />
            <Text style={styles.controlLabel}>Temp.</Text>
            <Text style={styles.controlValue}>{device.value || "25°C"}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.acControlItem} onPress={() => onSettingUpdate(device.id, 'wind')}>
            <Wind size={20} color="#10B981" />
            <Text style={styles.controlLabel}>Wind</Text>
            <Text style={styles.controlValue}>{device.wind || "Strong"}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.acControlItem} onPress={() => onSettingUpdate(device.id, 'mode')}>
            <Grid2X2 size={20} color="#F59E0B" />
            <Text style={styles.controlLabel}>Model</Text>
            <Text style={styles.controlValue}>{device.mode || "Mode 1"}</Text>
        </TouchableOpacity>
        <TouchableOpacity 
            style={styles.acControlItem} 
            onPress={() => onSettingUpdate(device.id, 'child_lock')}
        >
            <Lock size={20} color={device.child_lock ? "#EF4444" : "#94A3B8"} />
            <Text style={styles.controlLabel}>Child lock</Text>
            <Text style={styles.controlValue}>{device.child_lock ? "Turn on" : "Turn off"}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Config
const BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:8000' : 'http://localhost:8000';

export default function App() {
  const [devices, setDevices] = useState([
    {"id": "1", "name": "Light", "room": "Living room", "type": "light", "status": true, "icon": "lightbulb", "video_url": null},
    {"id": "2", "name": "Thermostat", "room": "Living room", "type": "thermostat", "status": false, "value": "30.5°C", "icon": "thermometer", "video_url": null},
    {"id": "3", "name": "Air purifier", "room": "Living room", "type": "air_purifier", "status": true, "icon": "wind", "video_url": null},
    {"id": "4", "name": "Switch", "room": "Living room", "type": "switch", "status": true, "icon": "toggle-right", "video_url": null},
    {"id": "5", "name": "Air conditioner", "room": "Living room", "type": "ac", "status": true, "value": "25°C", "icon": "snowflake", "wind": "Strong", "mode": "Mode 1", "child_lock": true, "video_url": null},
    {"id": "6", "name": "Sweeper", "room": "Living room", "type": "sweeper", "status": false, "icon": "bot", "video_url": null},
    {"id": "7", "name": "Light", "room": "Bedroom", "type": "light", "status": false, "icon": "lightbulb", "video_url": null},
    {"id": "8", "name": "Light", "room": "Kitchen", "type": "light", "status": true, "icon": "lightbulb", "video_url": null},
    {"id": "9", "name": "Entrance Cam", "room": "Living room", "type": "video", "status": true, "icon": "video", "video_url": null},
    {"id": "10", "name": "Nursery Cam", "room": "Bedroom", "type": "video", "status": true, "icon": "video", "video_url": null},
    {"id": "11", "name": "Kitchen Cam", "room": "Kitchen", "type": "video", "status": false, "icon": "video", "video_url": null},
  ]);
  const [categories] = useState(["Favorites", "Living room", "Bedroom", "Kitchen"]);
  const [activeCategory, setActiveCategory] = useState("Living room");

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    try {
      // NOTE: For Android Emulator use http://10.0.2.2:8000
      const response = await axios.get(`${BASE_URL}/devices`);
      setDevices(response.data);
    } catch (error) {
      console.error("Error fetching devices:", error);
    }
  };

  const handleToggle = async (id) => {
    try {
      const response = await axios.post(`${BASE_URL}/devices/${id}/toggle`);
      setDevices(devices.map(d => d.id === id ? { ...d, status: response.data.device_status } : d));
    } catch (error) {
      console.error("Error toggling device:", error);
    }
  };

  const handleSettingUpdate = async (id, field) => {
    const device = devices.find(d => d.id === id);
    if (!device) return;

    let updatedDevices = [...devices];
    const index = updatedDevices.findIndex(d => d.id === id);

    if (field === 'child_lock') {
        updatedDevices[index].child_lock = !updatedDevices[index].child_lock;
    } else if (field === 'value') {
        const currentTemp = parseInt(device.value);
        updatedDevices[index].value = `${currentTemp >= 30 ? 16 : currentTemp + 1}°C`;
    } else if (field === 'wind') {
        const modes = ["Low", "Medium", "Strong"];
        const currentIndex = modes.indexOf(device.wind || "Strong");
        updatedDevices[index].wind = modes[(currentIndex + 1) % modes.length];
    } else if (field === 'mode') {
        const modes = ["Mode 1", "Mode 2", "Mode 3"];
        const currentIndex = modes.indexOf(device.mode || "Mode 1");
        updatedDevices[index].mode = modes[(currentIndex + 1) % modes.length];
    }

    setDevices(updatedDevices);
  };

  const handleUpload = async (id) => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 1,
    });

    if (!result.canceled) {
      const videoUri = result.assets[0].uri;
      const filename = videoUri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `video/${match[1]}` : `video`;

      const formData = new FormData();
      formData.append('file', {
        uri: Platform.OS === 'android' ? videoUri : videoUri.replace('file://', ''),
        name: filename,
        type: type,
      });

      try {
        const response = await axios.post(`${BASE_URL}/devices/${id}/upload`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        
        if (response.data.status === 'success') {
          setDevices(prev => prev.map(d => d.id === id ? { ...d, video_url: response.data.video_url } : d));
          alert('Video uploaded successfully!');
        }
      } catch (error) {
        console.error("Error uploading video:", error);
        alert('Failed to upload video');
      }
    }
  };

  const filteredDevices = activeCategory === "Favorites" 
    ? devices 
    : devices.filter(d => d.room.toLowerCase() === activeCategory.toLowerCase());

  const smallDevices = filteredDevices.filter(d => d.type !== 'ac' && d.type !== 'video');
  const acDevice = filteredDevices.find(d => d.type === 'ac');
  const videoDevices = filteredDevices.filter(d => d.type === 'video');

  return (
    <SafeAreaProvider>
    <LinearGradient colors={['#0F172A', '#1E293B']} style={styles.container}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <IconButton Icon={LayoutGrid} onPress={() => alert('Open Drawer Menu')} />
            <Text style={styles.headerTitle}>My home</Text>
          </View>
          <View style={styles.headerRight}>
            <View style={styles.profileIcon}>
                <LinearGradient colors={['#F472B6', '#6366F1']} style={styles.profileGradient} />
            </View>
            <IconButton Icon={Plus} onPress={() => alert('Add new device function')} />
          </View>
        </View>

        <View style={styles.categoryContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
            {categories.map(cat => (
                <CategoryTab 
                    key={cat} 
                    name={cat} 
                    active={cat === activeCategory} 
                    onPress={() => setActiveCategory(cat)}
                />
            ))}
            </ScrollView>
            <IconButton Icon={User} size={20} color="#94A3B8" onPress={() => alert('Switch User')} /> 
        </View>

        <ScrollView contentContainerStyle={styles.mainContent}>
          {videoDevices.length > 0 && (
            <View style={styles.videoSection}>
              <Text style={styles.sectionTitle}>Cameras</Text>
              {videoDevices.map(device => (
                <VideoCard 
                  key={device.id} 
                  device={device} 
                  onToggle={handleToggle} 
                  onUpload={handleUpload}
                  baseUrl={BASE_URL}
                />
              ))}
            </View>
          )}

          <View style={styles.deviceGrid}>
            {smallDevices.slice(0, 4).map(device => (
              <DeviceCard key={device.id} device={device} onToggle={handleToggle} />
            ))}
          </View>

          {acDevice && (
            <ACCard 
                device={acDevice} 
                onToggle={handleToggle} 
                onSettingUpdate={handleSettingUpdate}
            />
          )}

          <View style={styles.deviceGrid}>
            {smallDevices.slice(4).map(device => (
              <DeviceCard key={device.id} device={device} onToggle={handleToggle} />
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#F1F5F9',
    marginLeft: 15,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  profileIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: 'hidden',
  },
  profileGradient: {
    flex: 1,
  },
  iconButton: {
    padding: 5,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 20,
    marginVertical: 10,
  },
  categoryScroll: {
    paddingHorizontal: 20,
  },
  tab: {
    marginRight: 25,
    paddingBottom: 5,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#F1F5F9',
  },
  tabText: {
    fontSize: 16,
    color: '#94A3B8',
    fontWeight: '600',
  },
  activeTabText: {
    color: '#F1F5F9',
  },
  mainContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  deviceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  deviceCard: {
    width: '48%',
    backgroundColor: '#1E293B',
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
  },
  thermostatIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#94A3B8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  thermostatValue: {
    fontSize: 10,
    fontWeight: '700',
    color: '#F1F5F9',
  },
  activeIconContainer: {
    backgroundColor: '#475569',
  },
  powerBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activePowerBtn: {
    backgroundColor: '#10B981',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  cardInfo: {
    gap: 4,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F1F5F9',
  },
  roomName: {
    fontSize: 12,
    color: '#94A3B8',
  },
  acCard: {
    width: '100%',
    backgroundColor: '#1E293B',
    borderRadius: 24,
    padding: 20,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  acHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  acInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  acIcon: {
    fontSize: 32,
  },
  acTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F1F5F9',
  },
  acControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  acControlItem: {
    alignItems: 'center',
    gap: 5,
  },
  controlLabel: {
    fontSize: 14,
    color: '#F1F5F9',
    fontWeight: '500',
    marginTop: 5,
  },
  controlValue: {
    fontSize: 12,
    color: '#94A3B8',
  },
  videoSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F1F5F9',
    marginBottom: 15,
  },
  videoCard: {
    backgroundColor: '#1E293B',
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 16,
  },
  videoPreview: {
    height: 180,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoContent: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoOffline: {
    gap: 10,
  },
  offlineText: {
    color: '#4B5563',
    fontWeight: '600',
  },
  liveBadge: {
    position: 'absolute',
    top: 15,
    left: 15,
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  liveText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
  },
  videoFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#1E293B',
  },
  videoActive: {
      flex: 1,
      width: '100%',
  },
  fullVideo: {
    width: '100%',
    height: '100%',
  },
  videoActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  uploadBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
  }
});
